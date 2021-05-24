"use strict";

import Sequelize from "sequelize";
import fs from "fs";
import path from "path";
import logger from "../../config/winston/get-default-logger";

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../../config/sequelize.js")[env];
const db = {};

let sequelize;

if (config.url) sequelize = new Sequelize(config.url, config);

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js"
        );
    })
    .forEach((file) => {
        logger.info(`Loading model file ${file}`);
        const model = require(path.join(__dirname, file))(
            sequelize,
            Sequelize.DataTypes
        );
        db[model.name] = model;
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

sequelize
    .sync({ alter: true })
    .then(() => {
        logger.info("Database synchronized");
    })
    .catch((error) => {
        if (error) {
            logger.error("An error occured: ", error);
        }
    });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
