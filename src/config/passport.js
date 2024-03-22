const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GithubStrategy = require("passport-github2").Strategy;

const bcrypt = require("bcryptjs");

require("dotenv").config();

const usersAccountsServices = require("../services/usersAccounts");
const notificationsServices = require("../services/notifications");
const emailsServices = require("../services/emails");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // Match email
          const accountFound = await usersAccountsServices.checkEmailExists(
            email
          );

          if (accountFound) {
            // Match password
            bcrypt.compare(
              password,
              accountFound.password,
              async (err, isMatch) => {
                if (err) {
                  return done(err, null);
                }
                if (isMatch) {
                  const account = await usersAccountsServices.getAccountById(
                    accountFound.id
                  );

                  if (account.isBanned === true) {
                    return done(null, false, {
                      statusCode: 400,
                      msg: "This account is banned! Please contact the admin of the page...",
                    });
                  }

                  if (
                    account.isAdmin === false &&
                    account.isVerified === false
                  ) {
                    return done(null, false, {
                      statusCode: 400,
                      msg: "Please verify your account!",
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
          callbackURL: "/api/users/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const userFound = await usersAccountsServices.checkEmailExists(
              profile.emails[0].value
            );

            if (userFound) {
              const account = await usersAccountsServices.getAccountById(
                userFound.id
              );

              return done(null, account);
            } else {
              const accountCreated =
                await usersAccountsServices.createAccountFromGithubOrGoogle(
                  profile.emails[0].value
                );

              if (accountCreated) {
                const account = await usersAccountsServices.getAccountById(
                  accountCreated.id
                );

                const url = `${process.env.URL}/api/users/account/${account.id}/verify`;

                await emailsServices.sendEmailVerification(url, account.email);

                await notificationsServices.createNotification(
                  accountCreated.id,
                  "Your account was created successfully!"
                );

                return done(null, accountCreated);
              }
            }
          } catch (error) {
            return done(error, null);
          }
        }
      )
    );

  // Github Strategy
  passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        scope: ["user:email"],
        callbackURL: "/api/users/auth/github/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const userFound = await usersAccountsServices.checkEmailExists(
            profile.emails[0].value
          );

          if (userFound) {
            const account = await usersAccountsServices.getAccountById(
              userFound.id
            );

            return done(null, account);
          } else {
            const accountCreated =
              await usersAccountsServices.createAccountFromGithubOrGoogle(
                profile.emails[0].value
              );

            if (accountCreated) {
              const account = await usersAccountsServices.getAccountById(
                accountCreated.id
              );

              const url = `${process.env.URL}/api/users/account/${account.id}/verify`;

              await emailsServices.sendEmailVerification(url, account.email);

              await notificationsServices.createNotification(
                accountCreated.id,
                "Your account was created successfully!"
              );

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
      const accountFound = await usersAccountsServices.getAccountById(id);
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
