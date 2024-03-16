const { DataTypes } = require("sequelize");
const db = require("../db");

const Token = db.define(
  "token",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    createdAt: true,
  }
);

module.exports = Token;
