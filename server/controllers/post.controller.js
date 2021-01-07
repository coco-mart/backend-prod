import User from "../models/user_profiles";
import { posts as Post } from "../models";
import { getPlaceInfo } from "./places.controller";

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
 * Create new post
 */
async function getPosts(req, res, next) {
    const { mobile } = req.user;
    const posts = await Post.findAll({
        where: { mobile },
    });
    res.json({ posts });
}

export default {
    create,
    getPosts,
};
