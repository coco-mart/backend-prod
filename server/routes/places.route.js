import express from "express";
import placesCtrl from "../controllers/places.controller";
import expressJwt from "express-jwt";
import config from "../../config/config";
const router = express.Router(); // eslint-disable-line new-cap

router.route("/autocomplete").get(
    expressJwt({
        secret: config.jwtSecret,
    }),
    placesCtrl.autocomplete
);

router.route("/geocode").get(
    expressJwt({
        secret: config.jwtSecret,
    }),
    placesCtrl.geocode
);

export default router;
