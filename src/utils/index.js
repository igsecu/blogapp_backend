const fs = require("fs");

// Regular expression to check if string is a valid UUID
const regexExp =
  /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

// Validate id
const validateId = (id) => {
  return regexExp.test(id);
};

const check = (headers) => {
  return (buffers, options = { offset: 0 }) =>
    headers.every(
      (header, index) => header === buffers[options.offset + index]
    );
};

const validateFileType = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert data to ArrayBuffer
      const arrayBuffer = data.buffer.slice(0, 8);

      const uint8Array = new Uint8Array(arrayBuffer);

      // Use the 'arrayBuffer' here as needed
      const isPNG = check([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      const isJPEG = check([0xff, 0xd8, 0xff]);

      if (isPNG(uint8Array) === false && isJPEG(uint8Array) === false) {
        resolve("File format not allowed! Only JPG or PNG...");
      }

      return resolve(false);
    });
  });
};

const validateVideoFileType = (file) => {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      // Convert data to ArrayBuffer
      const arrayBuffer = data.buffer.slice(4, 8);

      const uint8Array = new Uint8Array(arrayBuffer);

      // Use the 'arrayBuffer' here as needed
      const isMP4 = check([0x66, 0x74, 0x79, 0x70]);

      if (isMP4(uint8Array) === false) {
        resolve("File format not allowed! Only MP4...");
      }

      return resolve(false);
    });
  });
};

const validateImageSize = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      const fileSizeInBytes = stats.size;

      const fileSizeInMb = fileSizeInBytes / (1024 * 1024);

      if (fileSizeInMb > 2) {
        resolve("File must be up to 2mb!");
      }

      return resolve(false);
    });
  });
};

// Validates password
const validatePassword = (password) => {
  if (!password) return "Password is missing";
  if (typeof password !== "string") return "Password must be a string";
  if (password.length < 8) return "Password must be at least 8 characters long";
  if (!hasCapitalLetter(password))
    return "Password must have one capital letter";
  if (!hasNumber(password)) return "Password must have one number";
  if (!hasSymbol(password)) return "Password must have one symbol";
  if (!hasSmallLetter(password)) return "Password must have one small letter";
  return false;
};

// Validates password confirmation
const validatePasswordConfirmation = (password, password2) => {
  if (!password2) return "Password Confirmation is missing";
  if (password !== password2)
    return "Password and Password Confirmation not match";

  return false;
};

// Validates email
const validateEmail = (email) => {
  if (email === 0 || email === false) return "Email must be a string";
  if (!email) return "Email is missing";
  if (typeof email !== "string") return "Email must be a string";
  if (email.split("@").length !== 2) return "Email format is not valid";
  if (email.split("@")[1].split(".").length < 2)
    return "Email format is not valid";
  for (s of email.split("@")[1].split(".")) {
    if (hasSymbol(s)) return "Email format not valid";
    if (hasNumber(s)) return "Email format not valid";
  }

  return false;
};

// Validates username
const validateUsername = (username) => {
  if (username === 0 || username === false) return "Username must be a string";
  if (!username) return "Username is missing";
  if (typeof username !== "string") return "Username must be a string";
  if (username.length < 4) return "Username must be at least 4 characters long";
  return false;
};

// Validates name
const validateName = (name) => {
  // if (text === 0) return "Name must be a string";
  if (!name) return "Name is missing";
  if (typeof name !== "string") return "Name must be a string";
  return false;
};

// Access Control User
const ensureAuthenticatedUser = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin === false) {
      next();
    } else {
      return res.status(401).json({
        statusCode: 401,
        msg: `You are not authorized! Please login with an User account...`,
      });
    }
  } else {
    return res.status(401).json({
      statusCode: 401,
      msg: `You are not authorized! Please login...`,
    });
  }
};

// Access Control Admin
const ensureAuthenticatedAdmin = (req, res, next) => {
  if (req.isAuthenticated()) {
    if (req.user.type === "ADMIN") {
      next();
    } else {
      return res.status(401).json({
        statusCode: 401,
        msg: `You are not authorized! Please login with a User account...`,
      });
    }
  } else {
    return res.status(401).json({
      statusCode: 401,
      msg: `You are not authorized! Please login...`,
    });
  }
};

/******************************* */

const hasCapitalLetter = (password) => {
  const passwordToArray = Array.from(password);

  for (c of passwordToArray) {
    if (capitalLetters.includes(c)) {
      return true;
    }
  }

  return false;
};

const hasSmallLetter = (password) => {
  const passwordToArray = Array.from(password);

  for (c of passwordToArray) {
    if (smallLetters.includes(c)) {
      return true;
    }
  }

  return false;
};

const hasNumber = (password) => {
  const passwordToArray = Array.from(password);

  for (c of passwordToArray) {
    if (nums.includes(c)) {
      return true;
    }
  }

  return false;
};

const hasSymbol = (password) => {
  const passwordToArray = Array.from(password);

  for (c of passwordToArray) {
    if (symbols.includes(c)) {
      return true;
    }
  }

  return false;
};

const smallLetters = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

const capitalLetters = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

const nums = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const symbols = [
  "!",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "(",
  ")",
  "-",
  "_",
  "<",
  ">",
  ".",
  ",",
  "?",
  "/",
  "\\",
  "|",
  "=",
  "+",
  "-",
];

module.exports = {
  validateId,
  validateFileType,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  validateVideoFileType,
  validateUsername,
  ensureAuthenticatedUser,
  ensureAuthenticatedAdmin,
  validateImageSize,
  validateName,
};
