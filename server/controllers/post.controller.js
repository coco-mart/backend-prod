import { posts as Post } from "../models";
import { user_profiles as UserProfile } from "../models";
import { getPlaceInfo } from "./places.controller";
import httpStatus from "http-status";
import { Op, QueryTypes } from "sequelize";
import { get as lodashGet } from "lodash";
import {
    deleteImages,
    emptyS3Directory,
    uploadImages,
} from "../services/s3.service";
import APIError from "../helpers/APIError";
import db from "../models/index";
/*
 * Create new post
 */
async function create(req, res, next) {
    const { mobile } = req.user;
    let processedData = {
        ...req.body,
        mobile,
    };
    delete processedData.images;
    await getPlaceInfo(processedData.place_id)
        .then(({ data }) => {
            const { address_components, geometry } = data.result;
            const locality = address_components.find((component) =>
                component.types.includes("locality")
            );

            processedData.place_title = locality
                ? locality.long_name
                : processedData.place_title;

            const point = {
                type: "Point",
                coordinates: [geometry.location.lat, geometry.location.lng],
            };
            processedData.location = point;
        })
        .catch((err) => {
            console.log(err);
            next(err);
        });

    let createdPost = await Post.create(processedData);

    if (createdPost.id && req.files?.length) {
        let imageLocations = await Promise.all(
            uploadImages(mobile, createdPost.id, req.files)
        );
        imageLocations = imageLocations.map(({ Location }) => Location);
        createdPost.images = imageLocations;
        createdPost = await createdPost.save();
        res.json({ createdPost });
    } else if (createdPost.id) {
        createdPost = await createdPost.save();
        res.json({ createdPost });
    } else {
        next(
            new APIError(
                "Something went wrong",
                httpStatus.INTERNAL_SERVER_ERROR,
                true
            )
        );
    }
}

/*
 * Fetch posts of particular user
 */
async function getPosts(req, res, next) {
    const { mobile } = req.user;
    const { offset = 0, limit = null } = req.query;
    const posts = await Post.findAll({
        where: { mobile },
        offset,
        limit,
    });
    res.json({ posts });
}

/*
 * Fetch post by id
 */

async function getPostById(req, res, next) {
    const { id } = req.params;
    const post = await Post.findOne({
        where: {
            id,
        },
        include: UserProfile,
    });
    res.json({ post });
}

/*
 * Fetch all posts
 */

async function getAllPosts(req, res, next) {
    const {
        product,
        minQuantity,
        maxQuantity,
        minPrice,
        maxPrice,
        minDistance,
        maxDistance,
        lat,
        lng,
        sortBy,
        limit,
        offset,
    } = req.query;

    const posts = await db.sequelize.query(
        `select posts.id,
	posts.mobile,
	posts.product,
	posts.quantity,
	posts.price,
	posts.images,
	posts.pincode,
	posts.place_id,
	posts.place_title,
	posts.description,
	posts.location,
	created_at,
    updated_at, 
    distance,
	user_profile.mobile AS "user_profile.mobile", 
	user_profile.username AS "user_profile.username"
	from (
select
	posts.id,
	posts.mobile,
	posts.product,
	posts.quantity,
	posts.price,
	posts.images,
	posts.pincode,
	posts.place_id,
	posts.place_title,
	posts.description,
	posts.location,
	posts.created_at,               
	posts.updated_at,
	ST_Distance(location,ST_MakePoint(${lat || 11.0168},${
            lng || 76.9558
        }))/1000 as distance
from
	posts as posts) posts inner join 
	user_profiles as user_profile on
	posts.mobile = user_profile.mobile
where
	posts.distance between ${minDistance || 0} and ${maxDistance || "'Infinity'"} 
	${product === "all" ? "" : "and posts.product ='" + product + "' "}
	and posts.quantity between ${minQuantity || 0} and ${
            maxQuantity || "'Infinity'"
        }
	and posts.price between ${minPrice || 0} and ${maxPrice || "'Infinity'"}
order by
	${sortBy} ${limit ? "LIMIT " + limit + " " : ""} OFFSET ${offset || 0};`,
        {
            type: QueryTypes.SELECT,
            nest: true,
        }
    );
    res.json({ posts });
}

/*
 * Update post by id
 */
async function update(req, res, next) {
    const { mobile } = req.user;
    let processedData = {
        ...req.body,
        mobile,
    };
    const { id } = req.params;
    try {
        const postToDelete = await Post.findByPk(id);
        processedData.images = [...postToDelete.images];
        await getPlaceInfo(processedData.place_id)
            .then(({ data }) => {
                const { address_components, geometry } = data.result;
                const locality = address_components.find((component) =>
                    component.types.includes("locality")
                ).long_name;
                processedData.place_title = locality || title;
                processedData.lat = geometry.location.lat;
                processedData.lng = geometry.location.lng;
            })
            .catch((err) => next(err));
        if (processedData?.images_to_remove?.length) {
            await deleteImages(processedData.images_to_remove);
            processedData.images = [...processedData.images].filter(
                (img) => !processedData.images_to_remove.includes(img)
            );
        }
        if (req.files?.length) {
            let imageLocations = await Promise.all(
                uploadImages(mobile, id, req.files)
            );
            imageLocations = imageLocations.map(({ Location }) => Location);
            processedData.images = [...processedData.images, ...imageLocations];
        }
        const [updated] = await Post.update(processedData, {
            where: { id, mobile },
        });
        res.json({ updated });
    } catch (error) {
        console.log(error);
        next(error);
    }
}

/*
 * Delete post by id
 */
async function remove(req, res, next) {
    const { mobile } = req.user;
    const { id } = req.params;
    Post.destroy({ where: { id, mobile } })
        .then(async () => {
            await emptyS3Directory(mobile, id);
            res.json(httpStatus["204_MESSAGE"]);
        })
        .catch((err) => next(err));
}

export default {
    create,
    getPosts,
    getPostById,
    remove,
    update,
    getAllPosts,
};
