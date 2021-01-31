import { posts as Post } from "../models";
import { user_profiles as UserProfile } from "../models";
import { getPlaceInfo } from "./places.controller";
import httpStatus from "http-status";
import { Op } from "sequelize";
import { emptyS3Directory, uploadImages } from "../services/s3.service";
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
            ).long_name;
            processedData.place_title = locality || title;
            const point = {
                type: "Point",
                coordinates: [geometry.location.lat, geometry.location.lng],
            };
            processedData.location = point;
        })
        .catch((err) => next(err));
    let createdPost = await Post.create(processedData);
    if (createdPost.id) {
        let imageLocations = await Promise.all(
            uploadImages(mobile, createdPost.id, req.files)
        );
        imageLocations = imageLocations.map(({ Location }) => Location);
        createdPost.images = imageLocations;
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
    const posts = await Post.findAll({
        where: { mobile },
    });
    res.json({ posts });
}

/*
 * Fetch post by id
 */

async function getPostById(req, res, next) {
    const { mobile } = req.user;
    const { id } = req.params;
    const post = await Post.findOne({
        where: {
            id,
            mobile,
        },
    });
    res.json({ post });
}

/*
 * Fetch all posts
 */

async function getAllPosts(req, res, next) {
    const { mobile } = req.user;
    const { product, location } = req.query;
    const parsedLocation = JSON.parse(location);
    console.log("p", parsedLocation.lat, parsedLocation.lng);
    const posts = await Post.findAll({
        where: {
            mobile: {
                [Op.ne]: mobile,
            },
            product:
                !product || product == "all"
                    ? {
                          [Op.not]: product,
                      }
                    : product,
        },
        attributes: {
            include: [
                [
                    db.Sequelize.fn(
                        "ST_Distance",
                        db.Sequelize.col("location"),
                        db.Sequelize.fn(
                            "ST_MakePoint",
                            parsedLocation.lat,
                            parsedLocation.lng
                        )
                    ),
                    "distance",
                ],
            ],
        },
        include: {
            model: UserProfile,
            attributes: ["username"],
        },
        order: db.Sequelize.literal("distance ASC"),
    });
    console.log(posts);
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
    await Post.update(processedData, {
        where: {
            id,
            mobile,
        },
    })
        .then((data) => {
            if (data[0]) res.json(data);
            else
                next(new APIError("Bad Request", httpStatus.BAD_REQUEST, true));
        })
        .catch((err) => next(err));
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
