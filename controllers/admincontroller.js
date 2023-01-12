const adminHelper = require('../helpers/adminHelpers')
const user = require("../models/connection");


const adminCredential = {
  name: 'superAdmin',
  email: 'admin@gmail.com',
  password: 'admin123'
}
let adminStatus
let viewCategory
module.exports = {



  getAdminLogin: (req, res) => {

    console.log(adminloginErr);
    // res.render("admin/admin-dashboard", { layout: "adminLayout", adminStatus,adminloginErr})
    res.redirect('/admin')

  },


  postAdminLogin: (req, res) => {



    // console.log(req.body);
    if (req.body.email == adminCredential.email && req.body.password == adminCredential.password) {
      console.log("passwordcorrect");
      req.session.admin = adminCredential,
        req.session.adminloggedIn = true
      adminloginErr = false
      adminStatus = req.session.adminloggedIn

      res.redirect('/admin')
    }

    else {
      adminloginErr = true

      res.render('admin/login', { layout: "adminLayout", adminloginErr, adminStatus })
    }
  },


  getDashboard: (req, res) => {
    let variable = req.session.admin

    res.render("admin/admin-dashboard", { layout: "adminLayout", variable, adminStatus });



  },
  getViewUser: (req, res) => {
    adminHelper.getUsers().then((user) => {
      res.render("admin/view-users", { layout: "adminLayout", user, adminStatus });

    })
  },
  getBlockUser: (req, res) => {

    adminHelper.blockUser(req.params.id).then((response) => {

      res.redirect('/admin/view_users')
    })
  },
  getUnblockUser: (req, res) => {

    adminHelper.UnblockUser(req.params.id).then((response) => {

      res.redirect('/admin/view_users')
    })
  },
  getAdminLogOut: (req, res) => {
    req.session.admin = null
    req.session.adminloggedIn = false
    adminStatus = false

    res.render("admin/login", { layout: "adminLayout", adminStatus })
  },
  getCategory: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      viewCategory = response
      res.render("admin/add-category", { layout: "adminLayout", adminStatus, viewCategory });
    })

  },
  postCategory: (req, res) => {
    console.log(req.body.categoryname);
    adminHelper.addCategory(req.body).then((data) => {

      var categoryStatus = data.categoryStatus
      if (categoryStatus == false) {

        res.redirect('/admin/add_category');

      } else {


        adminHelper.viewAddCategory().then((response) => {
          viewCategory = response
          res.render("admin/add-category", { layout: "adminLayout", adminStatus, viewCategory, categoryStatus });
        })
      }

    })

  },
  getDeleteCategory: (req, res) => {

    adminHelper.deleteCategory(req.params.id).then((response) => {

      res.redirect('/admin/add_category')
    })

  },
  getEditCategory: (req, res) => {

    adminHelper.findCategory(req.params.id).then((response) => {
      console.log(response);
      res.render('admin/edit-category', { layout: "adminLayout", adminStatus, response })

    })


  },
  postEditCategory: (req, res) => {

    adminHelper.editCategory(req.params.id, req.body.categoryname).then((data) => {
      res.redirect('/admin/add_category')

    })

  },
  getAddProduct: (req, res) => {
    adminHelper.findAllCategory().then((response) => {
      console.log(response);
      res.render("admin/add-product", { layout: "adminLayout", adminStatus, response });
    })
  },
  postAddProduct: (req, res) => {
    let image = req.files.map(files => (files.filename))
    console.log(image);
    adminHelper.AddProduct(req.body, image).then((response) => {
      res.redirect('/admin/view_product')
    })

  },
  getViewproduct: (req, res) => {
    adminHelper.ViewProduct().then((response) => {
      res.render("admin/view-product", { layout: "adminLayout", adminStatus, response });
    })

  },
  editViewProduct: (req, res) => {

    adminHelper.viewAddCategory().then((response) => {

      var procategory = response
      adminHelper.editProduct(req.params.id).then((response) => {
        editproduct = response
        console.log(editproduct);
        console.log(procategory);
        res.render('admin/edit-product', { layout: "adminLayout", adminStatus, editproduct, procategory });

      })
    })



  },

  //posteditaddproduct


  postEditAddProduct: (req, res) => {

    adminHelper.postEditProduct(req.params.id, req.body, req?.file?.filename).then((response) => {

      res.redirect('/admin/view_product')
    })


  },


  //delete view product 


  deleteViewProduct: (req, res) => {

    adminHelper.deleteViewProduct(req.params.id).then((response) => {
      res.redirect('/admin/view_product')
    })




  },
  coupons: async (req, res) => {
    let coupon = await adminHelper.getCoupons();
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        }`;
    };
    console.log(coupon);
    res.render("admin/coupon", {
      layout: "adminLayout",
      coupon,
      adminStatus,
      getDate,
    });
  
  },
  addCoupons: (req, res) => {
    res.render("admin/add-coupon", { layout: "adminLayout", adminStatus });
  },
  addNewCoupon: (req, res) => {
    data = {
      couponName: req.body.couponName,
      expiry: req.body.expiry,
      minPurchase: req.body.minPurchase,
      description: req.body.description,
      discountPercentage: req.body.discountPercentage,
      maxDiscountValue: req.body.maxDiscountValue,
    };
    console.log(data);
    adminHelper.addNewCoupon(data).then((response) => {
      res.json(response);
    });
  },
  generateCoupon: (req, res) => {
    console.log(req);
    adminHelper.generateCoupon().then((response) => {
      res.json(response);
    });
  },
  deleteCoupon: (req, res) => {
    console.log(req.params.id);
    adminHelper.deleteCoupon(req.params.id).then((response) => {
      res.json(response);
    });
  },

    getOrders: (req, res) => {
      res.render('admin/orders', { layout: "adminLayout", adminStatus })
    },



















      banner: (req, res) => {
        res.render('admin/banner-management-home', { layout: "adminLayout", adminStatus })
      },
        addBanner: (req, res) => {
          res.render('admin/addBanner', { layout: "adminLayout", adminStatus })
        },

}

