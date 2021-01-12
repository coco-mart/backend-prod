"use strict";
const { Model } = require("sequelize");
const posts = require("./posts");
module.exports = (sequelize, DataTypes) => {
    class user_profiles extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    user_profiles.init(
        {
            username: DataTypes.STRING(50),
            mobile: {
                primaryKey: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
            },
            pincode: DataTypes.INTEGER,
        },
        {
            sequelize,
            modelName: "user_profiles",
        }
    );
    return user_profiles;
};
