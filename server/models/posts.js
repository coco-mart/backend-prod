"use strict";
const { Model } = require("sequelize");
const user_profiles = require("./user_profiles");
module.exports = (sequelize, DataTypes) => {
    class posts extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            posts.belongsTo(models.user_profiles, {
                foreignKey: {
                    name: "mobile",
                },
            });
        }
    }
    posts.init(
        {
            mobile: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            product: DataTypes.STRING,
            quantity: DataTypes.FLOAT,
            price: DataTypes.FLOAT,
            images: DataTypes.ARRAY(DataTypes.STRING),
            pincode: DataTypes.STRING,
            place_id: DataTypes.STRING,
            place_title: DataTypes.STRING,
            description: DataTypes.STRING,
            lat: DataTypes.DOUBLE,
            lng: DataTypes.DOUBLE,
        },
        {
            sequelize,
            modelName: "posts",
        }
    );
    return posts;
};
