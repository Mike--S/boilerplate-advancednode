const passport = require('passport');
const ObjectID = require('mongodb').ObjectID;
const session = require('express-session');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => { 
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  db.collection('users').findOne(
      {_id: new ObjectID(id)},
      (err, doc) => {
        done(null, doc);
      }
  );
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    db.collection('users').findOne({ username: username }, function (err, user) {
      console.log('User '+ username +' attempted to log in.');
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!bcrypt.compareSync(password, user.password)) { return done(null, false); }
      return done(null, user);
    });
  }
));

module.exports = function (app, db) {
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  app.route('/login')
    .post(passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });

  app.route('/logout')
    .get((req, res) => {
      req.logout();
      res.redirect('/');
  });

  app.route('/register')
    .post((req, res, next) => {
      db.collection('users').findOne({ username: req.body.username }, function (err, user) {
        if(err) {
          next(err);
        } else if (user) {
          res.redirect('/');
        } else {
          db.collection('users').insertOne(
            {username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 12)},
            (err, doc) => {
              if(err) {
                res.redirect('/');
              } else {
                next(null, user);
              }
            }
          )
        }
      })},
      passport.authenticate('local', { failureRedirect: '/' }),
      (req, res, next) => {
        res.redirect('/profile');
      }
    );
  
  app.route('/auth/github')
    .get(passport.authenticate('github'), (req, res) => {
    });
  
  app.route('/auth/github/callback')
    .get(passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
      res.redirect('/profile');
    });
}