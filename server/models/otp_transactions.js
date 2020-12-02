"use strict";
const moment = require("moment");
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class otp_transactions extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    otp_transactions.init(
        {
            mobile: {
                primaryKey: true,
                type: DataTypes.BIGINT,
                allowNull: false,
                unique: true,
            },
            otp_id: {
                type: DataTypes.STRING,
                unique: true,
            },
            attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
        },
        {
            sequelize,
            modelName: "otp_transactions",
        }
    );
    return otp_transactions;
};
