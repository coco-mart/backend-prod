import express from "express";
import validate from "express-validation";
import paramValidation from "../../config/param-validation";
import userCtrl from "../controllers/user.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
const router = express.Router(); // eslint-disable-line new-cap

const multer = require("multer");
const storage = multer.memoryStorage({
    destination: function (req, file, callback) {
        callback(null, "");
    },
});
const singleUpload = multer({ storage: storage }).single("picture");

router.route("/").patch(
    expressJwt({
        secret: config.jwtSecret,
    }),
    validate(paramValidation.updateUser),
    userCtrl.update
);

router.route("/").get(
    expressJwt({
        secret: config.jwtSecret,
    }),
    userCtrl.list
);

router
    .route("/sendotp")
    .post(validate(paramValidation.sendotp), userCtrl.sendotp);

router.route("/login").post(validate(paramValidation.login), userCtrl.login);

router.route("/uploadprofile").post(
    expressJwt({
        secret: config.jwtSecret,
    }),
    singleUpload,
    userCtrl.uploadImage
);

router.route("/verify").get(
    expressJwt({
        secret: config.jwtSecret,
        algorithms: ["HS256"],
    }),
    userCtrl.verifyUser
);

// router
//     .route("/:userId")
//     .get(userCtrl.get)
//     .put(validate(paramValidation.updateUser), userCtrl.update)
//     .delete(userCtrl.remove);

export default router;
