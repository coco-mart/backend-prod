import express from "express";
import validate from "express-validation";
import paramValidation from "../../config/param-validation";
import postCtrl from "../controllers/post.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
const router = express.Router(); // eslint-disable-line new-cap

router.route("/").post(
    expressJwt({
        secret: config.jwtSecret,
    }),
    validate(paramValidation.createPost),
    postCtrl.create
);

router.route("/").get(
    expressJwt({
        secret: config.jwtSecret,
    }),
    postCtrl.getPosts
);

export default router;
