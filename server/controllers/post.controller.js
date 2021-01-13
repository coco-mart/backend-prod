import { posts as Post } from "../models";
import { user_profiles as UserProfile } from "../models";

import { getPlaceInfo } from "./places.controller";
import httpStatus from "http-status";
import { Op } from "sequelize";

/*
 * Create new post
 */
async function create(req, res, next) {
    const { mobile } = req.user;
    const { title, place_id } = req.body.location;
    let processedData = {
        ...req.body,
        place_title: title,
        place_id,
        mobile,
    };
    delete processedData.location;
    delete processedData.images;
    await getPlaceInfo(place_id)
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
    const createdPost = await Post.create(processedData);
    res.json(createdPost);
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
    const { product } = req.query;
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
        include: {
            model: UserProfile,
            attributes: ["username"],
        },
    });
    res.json({ posts });
}

/*
 * Update post by id
 */
async function update(req, res, next) {
    const { mobile } = req.user;
    const { id } = req.params;
    const { title, placeId: place_id } = req.body.location;
    let processedData = {
        ...req.body,
        place_title: title,
        place_id,
    };
    delete processedData.location;
    delete processedData.images;
    await getPlaceInfo(place_id)
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
        .then((data) => res.json(data))
        .catch((err) => next(err));
}

/*
 * Delete post by id
 */
async function remove(req, res, next) {
    const { mobile } = req.user;
    const { id } = req.params;
    Post.destroy({ where: { id, mobile } })
        .then(() => res.json(httpStatus["204_MESSAGE"]))
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
