import httpStatus from "http-status";
import User from "../models/user_profiles";
import { user_profiles as UserProfile } from "../models";
import { otp_transactions as OtpTransaction } from "../models";
import otpService from "../services/otp.service";
import APIError from "../helpers/APIError";
import jwt from "jsonwebtoken";
import config from "../../config/config";
/**
 * Load user and append to req.
 */
async function sendotp(req, res, next) {
    const { mobile } = req.body;
    const [user, created] = await OtpTransaction.findOrCreate({
        where: { mobile },
    });
    if (user.attempts >= 5)
        next(
            new APIError(
                "Please try again tommorow!",
                httpStatus.TOO_MANY_REQUESTS,
                true
            )
        );
    else
        otpService
            .sendotp(mobile)
            .then(async ({ data }) => {
                user.otp_id = data.otp_id;
                user.attempts = user.attempts + 1;
                user.save();
                res.json({ success: true, message: "OTP sent successfully" });
            })
            .catch((e) => {
                next(e);
            });
}

async function login(req, res, next) {
    const { mobile, otp } = req.body;
    const transaction = await OtpTransaction.findByPk(mobile);
    console.log("OTP VERIFICATION START", new Date());
    otpService
        .verify(mobile, transaction.otp_id, otp)
        .then(async ({ data }) => {
            console.log("OTP VERIFIED", new Date());
            if (data.status === "failed")
                throw new APIError(data.error, httpStatus.UNAUTHORIZED, true);
            else {
                const token = jwt.sign(
                    {
                        mobile,
                        expiresIn: 86400,
                    },
                    config.jwtSecret
                );
                const [user, created] = await UserProfile.findOrCreate({
                    where: { mobile },
                });
                console.log("DB OPERTATION DONE", new Date());
                res.json({ success: true, token, user });
            }
        })
        .catch((err) => next(err));
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
async function update(req, res, next) {
    const { user } = req;
    const { username, pincode } = req.body;
    const dbUser = await UserProfile.findByPk(user.mobile);
    dbUser.username = username;
    dbUser.pincode = pincode;
    dbUser
        .save()
        .then((savedUser) => res.json(savedUser))
        .catch((e) => next(e));
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
function list(req, res, next) {
    const { limit = 50 } = req.query;
    User.findAll({ limit })
        .then((users) => res.json(users))
        .catch((e) => next(e));
}

/**
 * Delete user.
 * @returns {User}
 */
function remove(req, res, next) {
    const { user } = req;
    const { username } = req.user;
    user.destroy()
        .then(() => res.json(username))
        .catch((e) => next(e));
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @returns {*}
 */
async function verifyUser(req, res) {
    const { user } = req;
    const dbUser = await UserProfile.findByPk(user.mobile);
    return res.json({
        user: dbUser,
        authorized: true,
        num: Math.random() * 100,
    });
}

export default {
    sendotp,
    login,
    update,
    verifyUser,
};
