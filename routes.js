module.exports = function (app, db) {
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
  };

  app.route('/')
    .get((req, res) => {
      res.render(process.cwd() + '/views/pug/index.pug', { showLogin: true, showRegistration: true });
    });

  app.route('/profile')
    .get(ensureAuthenticated, (req,res) => {
      res.render(process.cwd() + '/views/pug/profile', {username: req.user.username});
    });  

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
    });
}