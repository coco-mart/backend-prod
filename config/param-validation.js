import Joi from "joi";

export default {
    // POST /api/users
    sendotp: {
        body: {
            mobile: Joi.string()
                .required("Mobile number is required")
                .length(10),
        },
    },

    // POST /api/users/login
    login: {
        body: {
            mobile: Joi.string().required().length(10),
            otp: Joi.string().required().length(6),
        },
    },

    // UPDATE /api/users/:userId
    updateUser: {
        body: {
            user: Joi.object({
                pincode: Joi.string()
                    .allow(null)
                    .regex(/^[0-9]+$/)
                    .length(6),
                username: Joi.string().allow(null),
            }),
        },
    },
};
