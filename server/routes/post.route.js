import express from "express";
import validate from "express-validation";
import paramValidation from "../../config/param-validation";
import postCtrl from "../controllers/post.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
const router = express.Router(); // eslint-disable-line new-cap

const multer = require("multer");
const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, "");
    },
});
const multipleUpload = multer({ storage: storage }).array("image");

router.route("/").post(
    expressJwt({
        secret: config.jwtSecret,
    }),
    multipleUpload,
    validate(paramValidation.createPost),
    postCtrl.create
);

router.route("/").get(
    expressJwt({
        secret: config.jwtSecret,
    }),
    postCtrl.getPosts
);

router.route("/all").get(postCtrl.getAllPosts);

router
    .route("/:id")
    .get(
        expressJwt({
            secret: config.jwtSecret,
        }),
        postCtrl.getPostById
    )
    .patch(
        expressJwt({
            secret: config.jwtSecret,
        }),
        validate(paramValidation.createPost),
        postCtrl.update
    )
    .delete(
        expressJwt({
            secret: config.jwtSecret,
        }),
        postCtrl.remove
    );

export default router;
