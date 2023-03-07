const db = require('../models/connection')
module.exports = {
  userSession: (req, res, next) => {
    if (req.session.userLoggedIn) {
      next();
    } else {
      res.render("user/login");
    }
  },
  adminSession: (req, res, next) => {

    if (req.session.admin) {

      next();
    } else {
      res.render("admin/login", { layout: "adminLayout", adminStatus: false });
    }
  },
  isUserBlock: (async (req, res, next) => {
    let userId = req.session.user.id
    let user = await db.user.findOne({ _id: userId })
    console.log(user);
    if (!user.blocked) {
      console.log('hi');
      next()

    } else {
      console.log('hlo');

      res.redirect('/logout')
    }

  }),

}