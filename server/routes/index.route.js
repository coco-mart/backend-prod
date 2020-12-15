import express from "express";
import userRoutes from "./user.route";
import placesRoutes from "./places.route";
import "regenerator-runtime/runtime";

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get("/health-check", (req, res) => res.send("OK"));

// mount user routes at /users
router.use("/users", userRoutes);

router.use("/places", placesRoutes);

export default router;
