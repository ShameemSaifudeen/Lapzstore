const user = require("../../models/connection");
const bcrypt = require("bcrypt");
const { response } = require("../../app");
const ObjectId = require("mongodb").ObjectId;
// const razorpay=req
const Razorpay = require("razorpay");
const razorpay = require("../../thirdparty/razorpay");

const otp = require("../../thirdparty/otp");
const { log } = require("console");
const { resolve } = require("path");

const client = require("twilio")(otp.accountId, otp.authToken);

let number;
var instance = new Razorpay({
  key_id: razorpay.id,
  key_secret: razorpay.secret_id,
});
// razorpay instance

module.exports = {
  doSignUp: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      try {
        email = userData.email;
        existingUser = await user.user.findOne({ email });
        if (existingUser) {
          response = { emailStatus: true };
          resolve(response);
        } else {
          // ch
          let hashedPassword = await bcrypt.hash(userData.password, 10);
          const data = new user.user({
            username: userData.username,
            Password: hashedPassword,
            email: userData.email,
            phonenumber: userData.phonenumber,
          });

          await data.save(data).then((data) => {
            resolve({ data, emailStatus: false });
          });
        }
      } catch (err) {

      }
    });
  },
  doLogin: (userData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let users = await user.user.findOne({ email: userData.email });
        if (users) {
          if (users.blocked == false) {
            await bcrypt
              .compare(userData.password, users.Password)
              .then((status) => {
                if (status) {
                  id = users._id;

                  userName = users.username;

                  resolve({ id, response, loggedInStatus: true });
                } else {
                  resolve({ loggedInStatus: false });
                }
              });
          } else {
            resolve({ blockedStatus: true });
          }
        } else {
          resolve({ loggedInStatus: false });
        }
      } catch (err) {

      }
    });
  },

  placeOrder: (orderData, total) => {

    return new Promise(async (resolve, reject) => {
      let productdetails = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user),
          },
        },
        {
          $unwind: "$cartItems",
        },

        {
          $project: {
            item: "$cartItems.productId",
            quantity: "$cartItems.Quantity",
          },
        },

        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "productdetails",
          },
        },
        {
          $unwind: "$productdetails",
        },

        {
          $project: {
            image: "$productdetails.Image",
            category: "$productdetails.category",
            _id: "$productdetails._id",
            quantity: 1,
            productsName: "$productdetails.Productname",
            productsPrice: "$productdetails.Price",
          },
        },
      ]);


      let Address = await user.address.aggregate([
        { $match: { userid: ObjectId(orderData.user) } },
        { $unwind: "$Address" },
        { $match: { "Address._id": ObjectId(orderData.address) } },
        { $unwind: "$Address" },
        {
          $project: {
            item: "$Address",
          },
        },
      ]);

      const items = Address.map((obj) => obj.item);

      let orderaddress = items[0];
      let status = orderData["payment-method"] === "COD" ? "placed" : "pending";
      let orderstatus =
        orderData["payment-method"] === "COD" ? "success" : "pending";
      let orderdata = {
        name: orderaddress.fname,
        paymentStatus: status,
        paymentmode: orderData["payment-method"],
        // paymenmethod: orderData['payment-method'],
        productDetails: productdetails,
        shippingAddress: orderaddress,
        orderStatus: orderstatus,
        totalPrice: total,
      };

      let order = await user.order.findOne({ userid: orderData.user });

      if (order) {
        await user.order
          .updateOne(
            { userid: orderData.user },
            {
              $push: {
                orders: orderdata,
              },
            }
          )
          .then((productdetails) => {
            resolve(productdetails);
          });
      } else {
        let newOrder = user.order({
          userid: orderData.user,
          orders: orderdata,
        });

        await newOrder.save().then((orders) => {
          resolve(orders);
        });
      }
      await user.cart.deleteMany({ user: orderData.user }).then(() => {
        resolve();
      });
    });
  },
  generateRazorpay: (userId, total) => {


    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ userid: userId });

      let order = orders[0].orders.slice().reverse();

      let orderId = order[0]._id;

      total = total * 100;

      var options = {
        amount: Number(total),
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {

        } else {
          // console.log('new order:',order);

          resolve(order);

        }
      });
    });
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {

        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", razorpay.secret_id);
        hmac.update(
          details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
        );
        hmac = hmac.digest("hex");
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve();
        } else {
          reject("not match");
        }
      } catch (err) {

      }
    });
  },
  changePaymentStatus: (userId, orderId) => {
    ;
    return new Promise(async (resolve, reject) => {
      try {
        //  await user.order.findOne({'orders._id':orderId},{'orders.$':1})

        let users = await user.order.updateOne(
          { "orders._id": orderId },
          {
            $set: {
              "orders.$.orderStatus": "success",
              "orders.$.paymentStatus": "paid",
            },
          }
        );
        await user.cart.deleteMany({ user: userId });
        resolve();
      } catch (err) {

      }
    });
  },

  orderPage: (userId) => {
    return new Promise(async (resolve, reject) => {
      await user.order
        .aggregate([
          {
            $match: { userid: ObjectId(userId) },
          },
          {
            $unwind: "$orders",
          },
          {
            $sort: { "orders.createdAt": -1 },
          },
        ])
        .then((response) => {

          resolve(response);
        });
    });
  },
  viewOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let productid = await user.order.findOne(
        { "orders._id": orderId },
        { "orders.$": 1 }
      );

      let details = productid.orders[0];
      let order = productid.orders[0].productDetails;

      const productDetails = productid.orders.map(
        (object) => object.productDetails
      );
      const address = productid.orders.map((object) => object.shippingAddress);
      const products = productDetails.map((object) => object);


      resolve({ products, address, details });
    });
  },
  // invoice
  createData: (details) => {
    let address = details.address[0];
    let product = details.products[0][0];
    let orderDetails = details.details;

    var data = {
      // Customize enables you to provide your own templates
      // Please review the documentation for instructions and examples
      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        // logo: "https://freelogocreator.com/user_design/logo",
        // The invoice background
        // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "LAPZCART",
        address: "KOLLAM,KERALA,INDIA",
        zip: "691030",
        city: "KOLLAM",
        country: "INDIA",
      },
      // Your recipient
      client: {
        company: address.fname,
        address: address.street,
        zip: address.pincode,
        city: address.city,
        country: "India",
      },

      information: {
        number: address.mobile,
        date: "12-12-2021",
        "due-date": "31-12-2021",
      },

      products: [
        {
          quantity: product.quantity,
          description: product.productsName,
          "tax-rate": 0,
          price: product.productsPrice,
        },
      ],

      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank you for your order from LAPZCART",
      // Settings to customize your invoice
      settings: {
        currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        // "tax-notation": "gst", // Defaults to 'vat'
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
      },
      // Translate your invoice to your preferred language
      translate: {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal" // Defaults to 'Total'
      },
    };

    return data;
  },
  cancelOrder: (orderId, userId) => {

    return new Promise(async (resolve, reject) => {
      let orders = await user.order.find({ "orders._id": orderId });


      let orderIndex = orders[0].orders.findIndex(
        (orders) => orders._id == orderId
      );

      await user.order
        .updateOne(
          { "orders._id": orderId },
          {
            $set: {
              ["orders." + orderIndex + ".orderStatus"]: "cancelled",
            },
          }
        )
        .then((orders) => {

          resolve(orders);
        });
    });
  },
  returnOrder: (orderId) => {
    return new Promise(async (resolve, reject) => {
      await user.order
        .updateOne(
          { "orders._id": orderId },
          {
            $set: {
              "orders.$.orderStatus": "Returned",
            },
          }
        )
        .then((orders) => {

          resolve(orders);
        });
    });
  },

  // coupon

  applyCoupon: (code, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        let coupon = await user.coupon.findOne({ couponName: code });
        if (coupon) {
          //checking coupon Valid

          if (new Date(coupon.expiry) - new Date() > 0) {
            //checkingExpiry
            if (total >= coupon.minPurchase) {
              //checking max offer value
              let discountAmount = (total * coupon.discountPercentage) / 100;
              if (discountAmount > coupon.maxDiscountValue) {
                discountAmount = coupon.maxDiscountValue;
                total = total - discountAmount;
                resolve({
                  status: true,
                  discountAmount: discountAmount,
                  total: total,
                });
              } else {
                total = total - discountAmount;
                resolve({
                  status: true,
                  discountAmount: discountAmount,
                  total: total,
                });
              }
            } else {

              resolve({
                status: false,
                reason: `Minimum purchase value is ${coupon.minPurchase}`,
              });
            }
          } else {

            resolve({ status: false, reason: "coupon Expired" });
          }
        }
      } catch (error) {

      }
    });
  },
  couponVerify: (code, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let usedCoupon = await user.user.aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $unwind: "$coupons",
          },
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $match: {
              $and: [{ "coupons.couponName": code }, { "coupons.user": false }],
            },
          },
        ]);

        if (usedCoupon.length == 1) {
          resolve({ status: true });

        }
        //  else {

        //   resolve({ status: false, reason: "coupon is already Used" });
        // }
      } catch (err) {

      }
    });
  },

  couponValidator: async (code, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponExists = await user.coupon.findOne({ couponName: code });

        if (couponExists) {
          if (new Date(couponExists.expiry) - new Date() > 0) {
            let userCouponExists = await user.user.findOne({
              _id: userId,
              "coupons.couponName": code,
            });
            if (!userCouponExists) {
              couponObj = {
                couponName: code,
                user: false,
              };
              user.user
                .updateOne(
                  { _id: userId },
                  {
                    $push: {
                      coupons: couponObj,
                    },
                  }
                )
                .then(() => {
                  resolve({ status: true });
                });
            } else {
              resolve({ status: false, reason: "coupon already used" });
            }
          } else {
            resolve({ status: false, reason: "coupon expired" });
          }
        } else {
          resolve({ status: false, reason: "coupon does'nt exist" });
        }
      } catch (error) {

      }
    });
  },
  deleteCoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      await user.coupon.deleteOne({ _id: couponId }).then((response) => {
        resolve(response);
      });
    });
  },
};
