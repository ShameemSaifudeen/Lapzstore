const adminProductHelpers = require('../../helpers/admin/adminProductHelpers');
const adminHelper = require("../../helpers/admin/adminHelpers");
const adminCategoryHelpers = require('../../helpers/admin/adminCategoryHelpers')
const adminCouponHelpers = require('../../helpers/admin/adminCouponHelpers')
const adminOrderHelpers = require('../../helpers/admin/adminOrderHelpers')
const adminBannerHelpers = require('../../helpers/admin/adminBannerHelpers')
const user = require("../../models/connection");

const adminCredential = {
  name: "superAdmin",
  email: "admin@gmail.com",
  password: "admin123",
};
let adminStatus;
let viewCategory;
const getDate = (date) => {
  let orderDate = new Date(date);
  let day = orderDate.getDate();
  let month = orderDate.getMonth() + 1;
  let year = orderDate.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
    } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
      seconds
    )}`;
};
module.exports = {
  getAdminLogin: (req, res) => {
    res.redirect("/admin");
  },

  postAdminLogin: (req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      (req.session.admin = adminCredential), (req.session.adminloggedIn = true);
      adminloginErr = false;
      adminStatus = req.session.adminloggedIn;

      res.redirect("/admin");
    } else {
      adminloginErr = true;

      res.render("admin/login", {
        layout: "adminLayout",
        adminloginErr,
        adminStatus,
      });
    }
  },

  getDashboard: async (req, res) => {
    const variable = req.session.admin;
    let totalProducts,
      days = [];
    let ordersPerDay = {};
    let paymentCount = [];

    let Products = await adminProductHelpers.ViewProduct();

    totalProducts = Products.length;

    await adminOrderHelpers.getOrderByDate().then((response) => {
      let result = response[0].orders;
      for (let i = 0; i < result.length; i++) {
        let ans = {};

        ans["createdAt"] = result[i].createdAt;

        days.push(ans);

        ans = {};
      }

      days.forEach((order) => {
        const day = order.createdAt.toLocaleDateString("en-US", {
          weekday: "long",
        });

        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      });
    });
    let getCodCount = await adminOrderHelpers.getCodCount();

    let codCount = getCodCount.length;

    let getOnlineCount = await adminOrderHelpers.getOnlineCount();
    let onlineCount = getOnlineCount.length;
    let totalUser = await adminHelper.totalUserCount();

    let totalUserCount = totalUser.length;

    paymentCount.push(onlineCount);
    paymentCount.push(codCount);

    await adminOrderHelpers.getAllOrders().then((response) => {
      // ch
      let length = response.length;

      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i].orders.totalPrice;
      }
      res.render("admin/admin-dashboard", {
        layout: "adminLayout",
        adminStatus,
        length,
        total,
        totalProducts,
        ordersPerDay,
        variable,
        paymentCount,
        totalUserCount,
      });
    });

    // res.render("admin/admin-dashboard", { layout: "adminLayout", variable, adminStatus });
  },
  getViewUser: (req, res) => {
    adminHelper.getUsers().then((user) => {
      res.render("admin/view-users", {
        layout: "adminLayout",
        user,
        adminStatus,
      });
    });
  },
  getBlockUser: (req, res) => {
    adminHelper.blockUser(req.params.id).then((response) => {
      res.redirect("/admin/view_users");
    });
  },
  getUnblockUser: (req, res) => {
    adminHelper.UnblockUser(req.params.id).then((response) => {
      res.redirect("/admin/view_users");
    });
  },
  getAdminLogOut: (req, res) => {
    req.session.admin = null;
    req.session.adminloggedIn = false;
    adminStatus = false;

    res.render("admin/login", { layout: "adminLayout", adminStatus });
  },
  getCategory: (req, res) => {
    adminCategoryHelpers.viewAddCategory().then((response) => {
      viewCategory = response;
      res.render("admin/add-category", {
        layout: "adminLayout",
        adminStatus,
        viewCategory,
      });
    });
  },
  postCategory: (req, res) => {
    adminCategoryHelpers.addCategory(req.body).then((data) => {
      let categoryStatus = data.categoryStatus;
      if (categoryStatus == false) {
        res.redirect("/admin/add_category");
      } else {
        adminCategoryHelpers.viewAddCategory().then((response) => {
          viewCategory = response;
          res.render("admin/add-category", {
            layout: "adminLayout",
            adminStatus,
            viewCategory,
            categoryStatus,
          });
        });
      }
    });
  },
  getDeleteCategory: (req, res) => {
    adminCategoryHelpers.deleteCategory(req.params.id).then((response) => {
      res.redirect("/admin/add_category");
    });
  },
  getEditCategory: (req, res) => {
    adminCategoryHelpers.findCategory(req.params.id).then((response) => {
      res.render("admin/edit-category", {
        layout: "adminLayout",
        adminStatus,
        response,
      });
    });
  },
  postEditCategory: (req, res) => {
    adminCategoryHelpers
      .editCategory(req.params.id, req.body.categoryname)
      .then((data) => {
        res.redirect("/admin/add_category");
      });
  },
  getAddProduct: (req, res) => {
    adminCategoryHelpers.findAllCategory().then((response) => {
      res.render("admin/add-product", {
        layout: "adminLayout",
        adminStatus,
        response,
      });
    });
  },
  postAddProduct: (req, res) => {
    let image = req.files.map((files) => files.filename);
    adminProductHelpers.AddProduct(req.body, image).then((response) => {
      res.redirect("/admin/view_product");
    });
  },
  getViewproduct: (req, res) => {
    adminProductHelpers.ViewProduct().then((response) => {
      res.render("admin/view-product", {
        layout: "adminLayout",
        adminStatus,
        response,
      });
    });
  },
  editViewProduct: (req, res) => {
    adminCategoryHelpers.viewAddCategory().then((response) => {
      var procategory = response;
      adminProductHelpers.editProduct(req.params.id).then((response) => {
        editproduct = response;
        res.render("admin/edit-product", {
          layout: "adminLayout",
          adminStatus,
          editproduct,
          procategory,
        });
      });
    });
  },

  //posteditaddproduct

  postEditAddProduct: (req, res) => {
    adminProductHelpers
      .postEditProduct(req.params.id, req.body, req?.file?.filename)
      .then((response) => {
        res.redirect("/admin/view_product");
      });
  },

  listProduct: (req, res) => {
    adminProductHelpers.listProduct(req.params.id).then(() => {
      res.json({ status: true });
    });
  },
  unlistProduct: (req, res) => {
    adminProductHelpers.unlistProduct(req.params.id).then(() => {
      res.json({ status: false });
    });
  },

  //delete view product

  deleteViewProduct: (req, res) => {
    adminProductHelpers.deleteViewProduct(req.params.id).then((response) => {
      res.redirect("/admin/view_product");
    });
  },
  coupons: async (req, res) => {
    let coupon = await adminCouponHelpers.getCoupons();
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        }`;
    };
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
    adminCouponHelpers.addNewCoupon(data).then((response) => {
      res.json(response);
    });
  },
  generateCoupon: (req, res) => {
    adminCouponHelpers.generateCoupon().then((response) => {
      res.json(response);
    });
  },
  deleteCoupon: (req, res) => {
    adminCouponHelpers.deleteCoupon(req.params.id).then((response) => {
      res.json(response);
    });
  },

  getOrderList: (req, res) => {
    adminOrderHelpers.orderPage().then((response) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
            seconds
          )}`;
      };
      res.render("admin/order-List", {
        layout: "adminLayout",
        adminStatus,
        response,
        getDate,
      });
    });
  },

  // get order details

  getOrderDetails: (req, res) => {
    adminOrderHelpers.orderDetails(req.query.orderid).then((order) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
            seconds
          )}`;
      };

      let products = order.orders[0].productDetails;
      let total = order.orders;
      res.render("admin/order-details", {
        layout: "adminLayout",
        adminStatus,
        order,
        products,
        total,
        getDate,
      });
    });
  },

  // change user payments status

  postOrderDetails: (req, res) => {
    adminOrderHelpers
      .changeOrderStatus(req.query.orderId, req.body)
      .then((response) => {
        res.redirect("/admin/orders_list");
      });
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
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
    };
    let report = await adminOrderHelpers.getSalesReport();
    let total = await adminOrderHelpers.gettotalamount();
    let Details = [];
    report.forEach((orders) => {
      Details.push(orders.orders);
    });
    // report.forEach(orders => {userdata.push( orders.orders.shippingAddress)})

    res.render("admin/sales-report", {
      layout: "adminLayout",
      adminStatus,
      Details,
      getDate,
      total,
    });
  },
  postSalesReport: async (req, res) => {
    let Details = [];
    let total = await adminOrderHelpers.getTotalAmount(req.body);

    adminOrderHelpers.postReport(req.body).then((orderdata) => {
      orderdata.forEach((orders) => {
        Details.push(orders.orders);
      });

      res.render("admin/sales-report", {
        layout: "adminLayout",
        adminStatus,
        Details,
        getDate,
        total,
      });
    });
  },
  getAddBanner: (req, res) => {
    res.render("admin/add-banner", { layout: "adminLayout", adminStatus });
  },
  postAddBanner: (req, res) => {
    adminBannerHelpers.addBanner(req.body, req?.file?.filename).then((response) => {
      res.redirect("/admin/add_banner");
    });
  },

  //edit banner

  listBanner: (req, res) => {
    adminBannerHelpers.listBanner().then((response) => {
      admins = req.session.admin;

      res.render("admin/list-banner", {
        layout: "adminLayout",
        response,
        adminStatus,
      });
    });
  },

  //edit banner

  getEditBanner: (req, res) => {
    adminBannerHelpers.editBanner(req.query.banner).then((response) => {
      res.render("admin/edit-banner", {
        layout: "adminLayout",
        response,
        adminStatus,
      });
    });
  },

  // post edit banner

  postEditBanner: (req, res) => {
    adminBannerHelpers
      .postEditBanner(req.query.editbanner, req?.body, req?.file?.filename)
      .then((response) => {
        res.redirect("/admin/list_banner");
      });
  },
};
