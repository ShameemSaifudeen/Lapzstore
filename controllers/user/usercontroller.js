const userhelpers = require("../../helpers/userhelpers");
const user = require("../../models/connection");
const otp = require("../../thirdparty/otp");
const ObjectId = require("mongodb").ObjectId;
const adminHelper = require("../../helpers/adminHelpers");
const { log } = require("console");

const client = require("twilio")(otp.accountId, otp.authToken);

let userSession, number, loggedUser, loggedUserId, homeList;
let count, numberStatus, otpStatus, total;
let wishCount;

module.exports = {
  getHome: async (req, res) => {
    userSession = req.session.userLoggedIn;
    if (req.session.userLoggedIn) {
      count = await userhelpers.getCartItemsCount(req.session.user.id);
      wishCount = await userhelpers.getWishCount(req.session.user.id);
      homeList = await userhelpers.shopListProduct();
      console.log(wishCount + "^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^66");
      res.render("user/user", { userSession, count, homeList, wishCount });
    } else {
      homeList = await userhelpers.shopListProduct();

      res.render("user/user", { userSession, homeList });
    }
  },
  getUserLogin: async (req, res) => {
    count = await userhelpers.getCartItemsCount(req.session.user.id);

    userSession = req.session.userLoggedIn;

    res.render("user/user", { userSession, count, homeList, wishCount });
  },

  // User Profile

  getProfile: async (req, res) => {
    let data = await userhelpers.findUser(req.session.user.id);
    res.render("user/profile", { userSession, data });
  },

  updateProfile: (req, res) => {
    userhelpers.updateProfile(req.body, req.query.userId).then((data) => {
      res.json({ data });
    });
  },
  resetPassword: (req, res) => {
    let user = req.session.user.id;
    console.log(user);
    res.render("user/reset-password", { userSession, user });
  },
  updatePassword: async (req, res) => {
    console.log(req.query.proId);
    let passResponse = await userhelpers.verifyPassword(
      req.body,
      req.query.proId
    );
    if (passResponse) {
      res.json(true);
    } else {
      res.json(false);
    }
  },

  getUserOtpLogin: (req, res) => {
    numberStatus = true;
    res.render("user/otplogin", { userSession, numberStatus });
  },
  postUserOtpLogin: async (req, res) => {
    console.log(req.body.number);

    number = req.body.number;
    let users = await user.user.find({ phonenumber: number }).exec();
    console.log(users._id + "itshere");

    loggedUser = users;

    if (users == false) {
      console.log("falsehi");
      numberStatus = false;
      res.render("user/otplogin", { userSession, numberStatus });
    } else {
      client.verify.v2
        .services(otp.serviceId)
        .verifications.create({ to: `+91 ${number}`, channel: "sms" })
        .then((verification) => console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          });
        });
      otpStatus = true;
      res.render("user/otp-entering", { otpStatus });
    }
  },

  postOtpVerify: (req, res) => {
    otpNumber = req.body.otp;

    client.verify.v2
      .services(otp.serviceId)
      .verificationChecks.create({ to: `+91 ${number}`, code: otpNumber })
      .then((verification_check) => {
        console.log(verification_check.status);
        console.log(verification_check);
        if (verification_check.valid == true) {
          console.log("hellllllllllllllllo");
          console.log(loggedUser);
          console.log(ObjectId(loggedUser[0]._id));

          let id = loggedUser[0]._id;

          req.session.user = { loggedUser, id };

          console.log(loggedUser);
          console.log("otphi");
          req.session.userLoggedIn = true;
          userSession = req.session.userLoggedIn;

          res.redirect("/");
        } else {
          console.log("otpnothi");
          otpStatus = false;
          res.render("user/otp-entering", { otpStatus });
        }
      });
  },
  getOtpVerify: (req, res) => {
    res.render("user/otp-entering");
  },

  postUserLogin: (req, res) => {
    userhelpers.doLogin(req.body).then((response) => {
      let loggedInStatus = response.loggedInStatus;
      let blockedStatus = response.blockedStatus;
      console.log(loggedInStatus);
      if (loggedInStatus == true) {
        req.session.user = response;
        req.session.userLoggedIn = true;
        userSession = req.session.userLoggedIn;
        res.redirect("/");
      } else {
        console.log(loggedInStatus);
        console.log(blockedStatus);

        blockedStatus;
        res.render("user/login", { loggedInStatus, blockedStatus });
      }
    });
  },
  getSignUp: (req, res) => {
    res.render("user/signup");
  },
  postSignUp: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {
      // ch
      let emailStatus = response.emailStatus;
      if (emailStatus == false) {
        res.redirect("/login");
      } else {
        res.render("user/signup", { emailStatus });
      }
    });
  },
  getShop: async (req, res) => {
    console.log(
      req.query.page + "_______________________________________________________"
    );
    let pageNum = req.query.page;
    let currentPage = pageNum;
    let perPage = 6;
    console.log(req.session.user.id);

    count = await userhelpers.getCartItemsCount(req.session.user.id);
    viewCategory = await adminHelper.viewAddCategory();
    documentCount = await userhelpers.documentCount();
    console.log(documentCount + "ppppppppppppp");
    let pages = Math.ceil(parseInt(documentCount) / perPage);
    // console.log(pages + "!!!!!!!!!!!");

    userhelpers.shopListProduct(pageNum).then((response) => {
      console.log(response);

      res.render("user/shop", {
        response,
        userSession,
        count,
        viewCategory,
        currentPage,
        documentCount,
        pages,
        wishCount,
      });
    });
  },
  category: async (req, res) => {
    viewCategory = await adminHelper.viewAddCategory();

    userhelpers.category(req.query.cname).then((response) => {
      res.render("user/filter-by-category", {
        response,
        userSession,
        viewCategory,
        count,
        wishCount,
      });
    });
  },

  getProductDetails: async (req, res) => {
    count = await userhelpers.getCartItemsCount(req.session.user.id);

    console.log(req.params.id);
    userhelpers.productDetails(req.params.id).then((data) => {
      console.log(data);
      res.render("user/eachproduct", { userSession, data, count, wishCount });
    });
  },

  getAddToCart: (req, res) => {
    console.log(req.params.id);
    console.log(req.session.user.id);

    userhelpers.addToCart(req.params.id, req.session.user.id).then((data) => {
      console.log(data);
      res.json({ status: true });
    });
  },

  getViewCart: async (req, res) => {
    // console.log(req);
    let userId = req.session.user;
    let total = await userhelpers.totalCheckOutAmount(req.session.user.id);
    count = await userhelpers.getCartItemsCount(req.session.user.id);

    let cartItems = await userhelpers.viewCart(req.session.user.id);
    // console.log(cartItems);
    console.log(cartItems.length + "::::::::::::");

    res.render("user/view-cart", {
      cartItems,
      userId,
      userSession,
      count,
      total,
      wishCount,
    });
  },
  postchangeProductQuantity: async (req, res) => {
    // let count=await userhelpers.getCartItemsCount(req.session.user.id)
    // console.log(req.body);
    await userhelpers.changeProductQuantity(req.body).then(async (response) => {
      console.log("hhhhhhhhhhhhhhhhhhhh");
      console.log(response + "controllers");
      response.total = await userhelpers.totalCheckOutAmount(req.body.user);

      res.json(response);
    });
  },

  getDeleteCart: (req, res) => {
    console.log(req.body);
    userhelpers.deleteCart(req.body).then((response) => {
      res.json(response);
    });
  },
  wishList: (req, res) => {
    console.log(req.session.user.id);

    userhelpers
      .AddToWishList(req.query.wishid, req.session.user.id)
      .then((response) => {
        res.json(response.status);
      });
  },

  ListWishList: async (req, res) => {
    wishCount = await userhelpers.getWishCount(req.session.user.id);
    console.log(wishCount + "__________________________________");
    await userhelpers
      .ListWishList(req.session.user.id)
      .then((wishlistItems) => {
        console.log(wishlistItems);

        res.render("user/wishlist", {
          wishlistItems,
          wishCount,
          count,
          userSession,
        });
      });
  },

  deleteWishList: (req, res) => {
    userhelpers.deleteWishList(req.body).then((response) => {
      res.json(response);
    });
  },

  checkOutPage: async (req, res) => {
    let users = req.session.user.id;

    let cartItems = await userhelpers.viewCart(req.session.user.id);
    console.log(cartItems);
    console.log(
      "________________________________________________________________________"
    );

    if (req.session.user.total) {
      total = req.session.user.total;
    } else {
      total = await userhelpers.totalCheckOutAmount(req.session.user.id);
    }

    userhelpers.checkOutpage(req.session.user.id).then((response) => {
      res.render("user/checkout", {
        users,
        cartItems,
        total,
        response,
        userSession,
        count,
      });
    });
  },
  postcheckOutPage: async (req, res) => {
    if (req.session.user.total) {
      total = req.session.user.total;
    } else {
      total = await userhelpers.totalCheckOutAmount(req.session.user.id);
    }
    req.session.user.total = null;
    let order = await userhelpers
      .placeOrder(req.body, total)
      .then((response) => {
        if (req.body["payment-method"] == "COD") {
          res.json({ codstatus: true });
        } else {
          userhelpers
            .generateRazorpay(req.session.user.id, total)
            .then((order) => {
              console.log(order.id);

              console.log(order.amount);
              res.json(order);
            });
        }
      });
  },
  postVerifyPayment: (req, res) => {
    console.log(req.body);
    userhelpers.verifyPayment(req.body).then(() => {
      console.log(req.body);

      userhelpers
        .changePaymentStatus(req.session.user.id, req.body["order[receipt]"])
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
          console.log(err);
          res.json({ status: false, err });
        });
    });
  },
  getOrderPage: (req, res) => {
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
        isNaN(year) ? "0000" : year
      } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
        seconds
      )}`;
    };
    userhelpers.orderPage(req.session.user.id).then((response) => {
      res.render("user/orderslist", {
        response,
        userSession,
        count,
        getDate,
        wishCount,
      });
    });
  },
  orderDetails: async (req, res) => {
    let details = req.query.order;
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let seconds = date.getSeconds();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${
        isNaN(year) ? "0000" : year
      } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
        seconds
      )}`;
    };

    await userhelpers.viewOrderDetails(details).then((response) => {
      console.log(response.products);
      let products = response.products[0];
      console.log(products);
      let address = response.address;
      let orderDetails = response.details;
      let data = userhelpers.createData(response);

      res.render("user/order-details", {
        products,
        address,
        orderDetails,
        userSession,
        count,
        getDate,
        data,
        wishCount,
      });
    });
  },
  orderSucess: (req, res) => {
    res.render("user/order-success", { userSession, count });
  },
  getCancelOrder: (req, res) => {
    console.log("--------", req.query.orderid);

    userhelpers
      .cancelOrder(req.query.orderid, req.session.user.id)
      .then((response) => {
        console.log("++++++++", response);
        res.json(response);
      });
  },
  putReturnOrder: (req, res) => {
    let user = req.session.user.id;
    let users = req.session.user;
    userhelpers.returnOrder(req.query.orderId).then((response) => {
      res.json(response);
    });
  },

  // for profile
  getAddress: async (req, res) => {
    let response = await userhelpers.checkOutpage(req.session.user.id);

    res.render("user/address", { response, userSession });
  },
  deleteAddress: (req, res) => {
    userhelpers.deleteAddress(req.body).then((response) => {
      console.log(response);
      res.json(response);
    });
  },

  getAddresspage: async (req, res) => {
    console.log(req.session.user.id);

    res.render("user/add-address", {
      userSession,
      viewCategory,
      count,
      wishCount,
    });
  },
  postAddresspage: (req, res) => {
    userhelpers.postAddress(req.session.user.id, req.body).then(() => {
      res.redirect("/check_out");
    });
  },
  applyCoupon: async (req, res) => {
    let code = req.query.code;
    // let total = await userhelpers.totalCheckOutAmount(req.session.user);
    userhelpers.applyCoupon(code, req.body.total).then((response) => {
      req.session.user.total = response.total;
      couponPrice = response.discountAmount ? response.discountAmount : 0;
      res.json(response);
    });
  },
  couponValidator: async (req, res) => {
    let code = req.query.code;
    userhelpers.couponValidator(code, req.session.user.id).then((response) => {
      console.log(response);
      res.json(response);
    });
  },
  couponVerify: async (req, res) => {
    let code = req.query.code;
    userhelpers.couponVerify(code, req.session.user.id).then((response) => {
      console.log(response);

      res.json(response);
    });
  },
  // search

  getSearch: async (req, res) => {
    viewCategory = await adminHelper.viewAddCategory();
    // console.log(req.query.page);
    // let pageNum = req.query.page
    // let perPage = 6

    // documentCount = await userproductHelpers.productCount()

    // let pages = Math.ceil((documentCount) / perPage)

    userhelpers
      .productSearch(req.body)
      .then((response) => {
        res.render("user/filter-by-category", {
          response,
          userSession,
          viewCategory,
          count,
          wishCount,
        });
        console.log(response);
      })
      .catch((err) => {
        res.render("user/filter-by-category", {
          err,
          userSession,
          viewCategory,
          count,
          wishCount,
        });

        console.log(err);
      });
  },
  postSort: async (req, res) => {
    console.log(req.body);
    let sortOption = req.body["selectedValue"];
    viewCategory = await adminHelper.viewAddCategory();
    userhelpers.postSort(sortOption).then((response) => {
      res.render("user/filter-by-category", {
        response,
        userSession,
        viewCategory,
        count,
        wishCount,
      });
    });
  },

  getLogout: (req, res) => {
    req.session.user = null;
    req.session.userLoggedIn = false;

    res.redirect("/login");
  },
};
