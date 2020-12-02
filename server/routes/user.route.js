import express from "express";
import validate from "express-validation";
import paramValidation from "../../config/param-validation";
import userCtrl from "../controllers/user.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
const router = express.Router(); // eslint-disable-line new-cap

router.route("/").patch(
    expressJwt({
        secret: config.jwtSecret,
    }),
    validate(paramValidation.updateUser),
    userCtrl.update
);

router
    .route("/sendotp")
    .post(validate(paramValidation.sendotp), userCtrl.sendotp);

router.route("/login").post(validate(paramValidation.login), userCtrl.login);

// router
//     .route("/:userId")
//     .get(userCtrl.get)
//     .put(validate(paramValidation.updateUser), userCtrl.update)
//     .delete(userCtrl.remove);

export default router;
