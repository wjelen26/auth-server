const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const localStrategy = require('passport-local');

//Create local Strategy
const localOptions = { usernameField: 'email' };
const localLogin = new localStrategy(localOptions, (email, password, done) => {
  User.findOne({ email: email }, (err, user) => {
    if (err) { return done(err); }
    if (!user) { return done(null, false); }

    // compare passwords
    user.comparePassword(password, (err, isMatch) => {
      if (err) { return done(err); }
      if(!isMatch) { return done(null, false)}

      return done(null, user)
    });
  })
});

//Setup options JWT Strategy
const jwOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

//Create JWT Strategy
const jwtLogin = new JwtStrategy(jwOptions, (payload, done) => {
  console.log(payload);
  User.findById(payload.sub, (err, user) => {
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false)
    }
  });
});

//Setup password to use JWT Strategy
passport.use(jwtLogin);
passport.use(localLogin);
