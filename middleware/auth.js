module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
        return next();
    }
    req.flash('error', 'Недостатньо прав для виконання цієї дії');
    next();
};

// Вихід з сесії (logout)
module.exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/auth/login'); // Перенаправляємо на сторінку логіну
    });
};

