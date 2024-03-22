const Token = require("../models/Token");

const uuid = require("uuid");

// Check if token exists
const tokenExists = async (id) => {
  try {
    const tokenExists = await Token.findOne({
      where: {
        blogAccountId: id,
      },
    });

    return tokenExists;
  } catch (error) {
    throw new Error("Error trying to check if token exists");
  }
};

// Delete token
const deleteToken = async (id) => {
  try {
    const tokenDeleted = await Token.destroy({
      where: {
        id,
      },
    });

    return tokenDeleted;
  } catch (error) {
    throw new Error("Error trying to delete a token");
  }
};

// Create new token
const createToken = async (id) => {
  try {
    const newToken = await Token.create({
      blogAccountId: id,
      token: uuid.v4(),
    });

    return newToken;
  } catch (error) {
    throw new Error("Error trying to create new token");
  }
};

// Check if token expires
const checkIfExpires = (token) => {
  const tokenTime = token.dataValues.createdAt.getTime();
  const expireTime = tokenTime + 3600 * 1000;
  const currentTime = new Date().getTime();

  return currentTime >= expireTime;
};

module.exports = {
  tokenExists,
  deleteToken,
  createToken,
  checkIfExpires,
};
