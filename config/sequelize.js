require("dotenv").config();

module.exports = {
    development: {
        url:
            "postgres://mmgymmjtvjprtc:e1d7d50494c57265dbbc28108d4fa6d6956f2da7d43fc03cc5d4e89d4a5af4c2@ec2-3-220-98-137.compute-1.amazonaws.com:5432/dad58c0nc25um6",
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },
    },
    test: {
        url: process.env.TEST_DATABASE_URL,
        dialect: "postgres",
    },
    production: {
        url: process.env.DATABASE_URL,
        dialect: "postgres",
    },
};
