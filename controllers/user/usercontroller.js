const userhelpers = require("../../helpers/user/userhelpers");
const profileHelpers = require("../../helpers/user/profileHelpers")
const productHelpers = require("../../helpers/user/productHelpers")
const cartHelpers = require("../../helpers/user/cartHelpers")
const wishListHelpers = require("../../helpers/user/wishListHelpers")
const addressHelpers = require("../../helpers/user/addressHelpers")
const user = require("../../models/connection");
const otp = require("../../thirdparty/otp");
const ObjectId = require("mongodb").ObjectId;
const adminHelper = require("../../helpers/admin/adminCategoryHelpers");
const { log } = require("console");

const client = require("twilio")(otp.accountId, otp.authToken);

let userSession, number, loggedUser, homeList;
let count, numberStatus, otpStatus, total;
let wishCount;
let couponTotal, couponName, discountAmount;

module.exports = {
  getHome: async (req, res) => {
    userSession = req.session.userLoggedIn;
    if (req.session.userLoggedIn) {
      count = await cartHelpers.getCartItemsCount(req.session.user.id);
      wishCount = await wishListHelpers.getWishCount(req.session.user.id);
      homeList = await productHelpers.shopListProduct();

      res.render("user/user", { userSession, count, homeList, wishCount });
    } else {
      homeList = await productHelpers.shopListProduct();

      res.render("user/user", { userSession, homeList });
    }
  },
  getUserLogin: async (req, res) => {
    count = await cartHelpers.getCartItemsCount(req.session.user.id);

    userSession = req.session.userLoggedIn;

    res.render("user/user", { userSession, count, homeList, wishCount });
  },

  // User Profile

  getProfile: async (req, res) => {
    const data = await profileHelpers.findUser(req.session.user.id);
    res.render("user/profile", { userSession, data });
  },

  updateProfile: (req, res) => {
    profileHelpers.updateProfile(req.body, req.query.userId).then((data) => {
      res.json({ data });
    });
  },
  resetPassword: (req, res) => {
    let user = req.session.user.id;
  
    res.render("user/reset-password", { userSession, user });
  },
  updatePassword: async (req, res) => {
   
    let passResponse = await profileHelpers.verifyPassword(
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
    

    number = req.body.number;
    let users = await user.user.find({ phonenumber: number }).exec();
    

    loggedUser = users;

    if (users == false) {
     
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
       
        if (verification_check.valid == true) {
        

          let id = loggedUser[0]._id;

          req.session.user = { loggedUser, id };

      
          req.session.userLoggedIn = true;
          userSession = req.session.userLoggedIn;

          res.redirect("/");
        } else {
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
    
      if (loggedInStatus == true) {
        req.session.user = response;
        req.session.userLoggedIn = true;
        userSession = req.session.userLoggedIn;
        res.redirect("/");
      } else {
      

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
  
    let pageNum = req.query.page;
    let currentPage = pageNum;
    let perPage = 6;
    count = await cartHelpers.getCartItemsCount(req.session.user.id);
    viewCategory = await adminHelper.viewAddCategory();
    documentCount = await productHelpers.documentCount(); 
    let pages = Math.ceil(parseInt(documentCount) / perPage);
    productHelpers.shopListProduct(pageNum).then((response) => {
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

    productHelpers.category(req.query.cname).then((response) => {
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
    count = await cartHelpers.getCartItemsCount(req.session.user.id);

    
    productHelpers.productDetails(req.params.id).then((data) => {
      console.log(data);
      console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      res.render("user/eachproduct", { userSession, data, count, wishCount });
    });
  },

  getAddToCart: (req, res) => {
   

    cartHelpers.addToCart(req.params.id, req.session.user.id).then((data) => {
    
      res.json({ status: true });
    });
  },

  getViewCart: async (req, res) => {
    
    let userId = req.session.user;
    let total = await cartHelpers.totalCheckOutAmount(req.session.user.id);
    count = await cartHelpers.getCartItemsCount(req.session.user.id);

    let cartItems = await cartHelpers.viewCart(req.session.user.id);

    res.render("user/view-cart", {
      cartItems,
      userId,
      userSession,
      count,
      total,
      wishCount,
    });
  },
  postCart: async (req, res) => {

    const couponData = req.body
    couponName = req.body.couponName
    couponTotal = req.body.total
    discountAmount = req.body.discountAmount
    if (couponData.couponName) {
      await userhelpers.addCouponInUseroDb(couponData, req.session.user.id).then((response) => {
        res.redirect("/check_out")
      })
    } else {
      res.redirect('/check_out')
    }

  },
  postchangeProductQuantity: async (req, res) => {
  
    await cartHelpers.changeProductQuantity(req.body).then(async (response) => {
    
      response.total = await cartHelpers.totalCheckOutAmount(req.body.user);

      res.json(response);
    });
  },

  getDeleteCart: (req, res) => {
   
    cartHelpers.deleteCart(req.body).then((response) => {
      res.json(response);
    });
  },
  wishList: (req, res) => {
   

    wishListHelpers
      .AddToWishList(req.query.wishid, req.session.user.id)
      .then((response) => {
        res.json(response.status);
      });
  },

  ListWishList: async (req, res) => {
    
    wishCount = await wishListHelpers.getWishCount(req.session.user.id);
   console.log(req.session.user.id);
    await wishListHelpers
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
    wishListHelpers.deleteWishList(req.body).then((response) => {
      res.json(response);
    });
  },
  validateCoupon: async (req, res) => {


    const code = req.query.couponName;
    let total = await cartHelpers.totalCheckOutAmount(req.session.user.id)
    userhelpers.couponValidator(code, req.session.user.id, total).then((response) => {
      res.json(response)
    })

  },
  checkOutPage: async (req, res) => {
    let users = req.session.user.id;
    let total;
    let cartItems = await cartHelpers.viewCart(req.session.user.id);
    let DiscountAmount
   
    
    if (couponName) {
      total = couponTotal
      DiscountAmount = "-" + discountAmount
    } else {
      total = await cartHelpers.totalCheckOutAmount(req.session.user.id)
      DiscountAmount = 0;
    }


    addressHelpers.checkOutpage(req.session.user.id).then((response) => {
      res.render("user/checkout", {
        users,
        cartItems,
        total,
        response,
        userSession,
        count,
        wishCount,
        DiscountAmount
      });
    });
  },
  postcheckOutPage: async (req, res) => {
    let DiscountAmount;
    let grandtotal = await cartHelpers.totalCheckOutAmount(req.session.user.id)
    let couponExist = await profileHelpers.findUser(req.session.user.id).then((data)=>{
      console.log(data);
    })
    if (couponName) {
      total = couponTotal
      DiscountAmount = discountAmount
    } else {
      total = await cartHelpers.totalCheckOutAmount(req.session.user.id)
      DiscountAmount = 0;
    }
    req.session.user.total = null;
    let order = await userhelpers
      .placeOrder(req.body, total, DiscountAmount, grandtotal)
      .then((response) => {
        if (req.body["payment-method"] == "COD") {
          res.json({ codstatus: true });
        } else {
          try {
            userhelpers
            .generateRazorpay(req.session.user.id, total)
            .then((order) => {
            
              res.json(order);
            });
          } catch (error) {
            res.status(500).send(error);
          }
        }
      });
  },
  postVerifyPayment: (req, res) => {
    userhelpers.verifyPayment(req.body).then(() => {

      userhelpers
        .changePaymentStatus(req.session.user.id, req.body["order[receipt]"])
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
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
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
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
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(
          seconds
        )}`;
    };

    await userhelpers.viewOrderDetails(details).then((response) => {
      let products = response.products[0];
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

    userhelpers
      .cancelOrder(req.query.orderid, req.session.user.id)
      .then((response) => {

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
    let response = await addressHelpers.checkOutpage(req.session.user.id);

    res.render("user/address", { response, userSession });
  },
  deleteAddress: (req, res) => {
    addressHelpers.deleteAddress(req.body).then((response) => {
    
      res.json(response);
    });
  },

  getAddresspage: async (req, res) => {
 
    res.render("user/add-address", {
      userSession,
      viewCategory,
      count,
      wishCount,
    });
  },
  postAddresspage: (req, res) => {
    addressHelpers.
      postAddress(req.session.user.id, req.body).then(() => {
        res.redirect("/check_out");
      });
  },
 
  // search

  getSearch: async (req, res) => {
    viewCategory = await adminHelper.viewAddCategory();
   

    productHelpers
      .productSearch(req.body)
      .then((response) => {
        res.render("user/filter-by-category", {
          response,
          userSession,
          viewCategory,
          count,
          wishCount,
        });
      })
      .catch((err) => {
        res.render("user/filter-by-category", {
          err,
          userSession,
          viewCategory,
          count,
          wishCount,
        });
      });
  },
  postSort: async (req, res) => {
    let sortOption = req.body["selectedValue"];
    viewCategory = await adminHelper.viewAddCategory();
    productHelpers.postSort(sortOption).then((response) => {
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
