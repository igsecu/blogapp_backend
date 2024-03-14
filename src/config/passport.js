const LocalStrategy = require("passport-local").Strategy;

const BlogAccount = require("../models/BlogAccount");

const bcrypt = require("bcryptjs");

const { getBlogAccountById } = require("../controllers/blogs");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Match email
          const accountFound = await BlogAccount.findOne({
            where: {
              email,
            },
          });
          if (accountFound) {
            // Match password
            if (accountFound.type === "LOCAL") {
              bcrypt.compare(
                password,
                accountFound.password,
                async (err, isMatch) => {
                  if (err) {
                    return done(err, null);
                  }
                  if (isMatch) {
                    const account = await getBlogAccountById(accountFound.id);

                    if (account.isBanned === true) {
                      return done(null, false, {
                        statusCode: 400,
                        msg: "This account is banned! Please contact the admin of the page...",
                      });
                    }

                    return done(null, account);
                  } else {
                    return done(null, false, {
                      statusCode: 400,
                      msg: `Incorrect password!`,
                    });
                  }
                }
              );
            } else {
              return done(null, false, {
                statusCode: 400,
                msg: `Incorrect password!`,
              });
            }
          } else {
            return done(null, false, {
              statusCode: 404,
              msg: `Email address not found!`,
            });
          }
        } catch (error) {
          return done(error, null);
        }
      }
    )
  ),
    // Google Strategy
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userFound = await BlogAccount.findOne({
              where: {
                email: profile.emails[0].value,
              },
            });

            if (userFound) {
              const account = await getBlogAccountById(userFound.id);

              if (account.isBanned === true) {
                return done(null, false, {
                  statusCode: 400,
                  msg: "This account is banned! Please contact the admin of the page...",
                });
              }

              if (account.type === "GOOGLE") {
                return done(null, account);
              }
            } else {
              const accountCreated = await BlogAccount.create({
                email: profile.emails[0].value,
                type: "GOOGLE",
              });
              if (accountCreated) {
                return done(null, accountCreated);
              }
            }
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const accountFound = await getBlogAccountById(id);
      if (accountFound) {
        done(null, accountFound);
      } else {
        done(null, { msg: `Account not found!` });
      }
    } catch (error) {
      done(error, null);
    }
  });
};
