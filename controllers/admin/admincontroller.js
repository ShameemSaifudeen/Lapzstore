const adminHelpers = require('../../helpers/adminHelpers');
const adminHelper = require('../../helpers/adminHelpers')
const user = require("../../models/connection");


const adminCredential = {
  name: 'superAdmin',
  email: 'admin@gmail.com',
  password: 'admin123'
}
let adminStatus
let viewCategory
const getDate = (date) => {
  let orderDate = new Date(date);
  let day = orderDate.getDate();
  let month = orderDate.getMonth() + 1;
  let year = orderDate.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
    } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
};
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


  getDashboard: async (req, res) => {
    let variable = req.session.admin
    let totalProducts, days = []
    let ordersPerDay = {};
    let paymentCount = []


    let Products = await adminHelper.ViewProduct()

    totalProducts = Products.length



    await adminHelper.getOrderByDate().then((response) => {
      let result = response[0].orders
      for (let i = 0; i < result.length; i++) {
        let ans = {}

        ans['createdAt'] = result[i].createdAt

        days.push(ans)

        ans = {}



      }



      days.forEach((order) => {
        const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });

        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;


      });

    })
    let getCodCount = await adminHelper.getCodCount()

    let codCount = getCodCount.length

    let getOnlineCount = await adminHelper.getOnlineCount()
    let onlineCount = getOnlineCount.length;
    let totalUser = await adminHelper.totalUserCount()

    let totalUserCount = totalUser.length



    paymentCount.push(onlineCount)
    paymentCount.push(codCount)


    await adminHelper.getAllOrders().then((response) => {
// ch
      let length = response.length

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;

      }
      console.log(totalProducts);
      res.render("admin/admin-dashboard", { layout: "adminLayout", adminStatus, length, total, totalProducts, ordersPerDay, variable, paymentCount, totalUserCount });

    })



    // res.render("admin/admin-dashboard", { layout: "adminLayout", variable, adminStatus });



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
// var
      let categoryStatus = data.categoryStatus
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

  listProduct: (req, res) => {
    adminHelper.listProduct(req.params.id).then(() => {
      res.json({ status: true });
    });
  },
  unlistProduct: (req, res) => {
    // console.log(req.params.id + "in unlist");
    adminHelper.unlistProduct(req.params.id).then(() => {
      res.json({ status: false });
    });
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

  getOrderList: (req, res) => {


    adminHelper.orderPage().then((response) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
      };
      res.render('admin/order-List', { layout: 'adminLayout', adminStatus, response, getDate })
    })
  },


  // get order details


  getOrderDetails: (req, res) => {
    console.log(req.query.orderid);
    adminHelper.orderDetails(req.query.orderid).then((order) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
      };

      let products = order.orders[0].productDetails
      let total = order.orders
      res.render('admin/order-details', { layout: 'adminLayout', adminStatus, order, products, total, getDate })
    })

  },

  // change user payments status

  postOrderDetails: (req, res) => {
    console.log(typeof req.query.orderId);
    console.log(req.body);
    console.log(req.body);
    adminHelper.changeOrderStatus(req.query.orderId, req.body).then((response) => {
      res.redirect('/admin/orders_list')
    })

  },

  // sales report

  getSalesReport: async (req, res) => {
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
    };
    console.log('reportttttttttttt');
    let report = await adminHelper.getSalesReport()
    let total = await adminHelper.gettotalamount()
    console.log(total);
    let Details = []
    report.forEach(orders => { Details.push(orders.orders) })
    // report.forEach(orders => {userdata.push( orders.orders.shippingAddress)})


    res.render('admin/sales-report', { layout: "adminLayout", adminStatus, Details, getDate ,total})


  },
  postSalesReport:async (req, res) => {

    let Details = [];
    let total = await adminHelper.getTotalAmount(req.body)


    adminHelper.postReport(req.body).then((orderdata) => {

      orderdata.forEach(orders => { Details.push(orders.orders) })


      res.render('admin/sales-report', { layout: "adminLayout", adminStatus, Details, getDate,total })
    })


  },
  getAddBanner: (req, res) => {

    res.render('admin/add-banner', { layout: 'adminLayout',adminStatus })
  },
  postAddBanner: (req, res) => {

    adminHelper.addBanner(req.body, req?.file?.filename).then((response) => {

      res.redirect('/admin/add_banner')

    })
  },

  //edit banner

  listBanner: (req, res) => {

    adminHelper.listBanner().then((response) => {

      admins = req.session.admin

      res.render('admin/list-banner', { layout: 'adminLayout', response, adminStatus })

    })

  },

  //edit banner


  getEditBanner: (req, res) => {

    adminHelper.editBanner(req.query.banner).then((response) => {

      res.render('admin/edit-banner', { layout: 'adminLayout', response, adminStatus })

    })

  },

  // post edit banner 


  postEditBanner: (req, res) => {

    console.log(req.file.filename);
    adminHelper.postEditBanner(req.query.editbanner, req?.body, req?.file?.filename).then((response) => {
      res.redirect('/admin/list_banner')

    })
  },

}



















      // banner: (req, res) => {
      //   res.render('admin/banner-management-home', { layout: "adminLayout", adminStatus })
      // },
      //   addBanner: (req, res) => {
      //     res.render('admin/addBanner', { layout: "adminLayout", adminStatus })
      //   },



