const isLoggedOut = (req, res, next) => {
    if(!req.session.currentUser) next();
    else res.redirect("profile");
}

module.exports = isLoggedOut;