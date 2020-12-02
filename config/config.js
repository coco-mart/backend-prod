import Joi from "joi";

// require and configure dotenv, will load vars in .env in PROCESS.ENV
require("dotenv").config();

// define validation for all the env vars
const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string()
        .allow(["development", "production", "test", "provision"])
        .default("development"),
    PORT: Joi.number().default(4000),
    API_VERSION: Joi.string().default("1").description("API Version"),
    D7_API: Joi.string().required(),
    JWT_SECRET: Joi.string()
        .required()
        .description("JWT Secret required to sign"),
})
    .unknown()
    .required();

const { error, value: envVars } = Joi.validate(process.env, envVarsSchema);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

/* eslint-disable no-unused-vars */
// if test, use test database
const isTestEnvironment = envVars.NODE_ENV === "test";

/* eslint-enable no-unused-vars */

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    apiVersion: envVars.API_VERSION,
    jwtSecret: envVars.JWT_SECRET,
    d7Api: envVars.D7_API,
};

export default config;
