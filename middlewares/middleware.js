module.exports = {
    userSession: (req, res, next) => {
      if (req.session.userLoggedIn) {
        console.log(req.session.userLoggedIn+"hi");
        next();
      } else {
        console.log("hi");
        res.render("user/login");
      }
    },
    adminSession: (req, res, next) => {
      
      // console.log(req.session.admin);

      if (req.session.admin) {
        
        // console.log(req.session.adminLoggedIn+"adminhi");
        next();
      } else {
        // console.log(req.session.userLoggedIn);
        // console.log(req.session.adminLoggedIn);
        console.log("adminloginhi");
        res.render("admin/login",{layout:"adminLayout",adminStatus:false});
      }
    },
    // userSignupSession: (req, res, next) => {
    //   if (req.session.userLoggedIn) {
    //     next();
    //   } else {
    //     res.render("user/signup");
    //   }
    // },
  }