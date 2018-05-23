module.exports = function(app, passport) {
    app.get('/', (req, res) => {
        res.render('index.ejs');
    });

    app.get('/profile', (req, res) => {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated())
        return next()

    res.redirect('/');
}
