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
            posts.belongsTo(models.user_profiles, { foreignKey: "mobile" });
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
            location: DataTypes.GEOGRAPHY("POINT", 4326),
            createdAt: {
                type: DataTypes.DATE,
                field: "created_at",
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: "updated_at",
            },
        },
        {
            sequelize,
            modelName: "posts",
        }
    );
    return posts;
};
