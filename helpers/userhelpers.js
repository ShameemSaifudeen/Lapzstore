const user = require("../models/connection");
const bcrypt = require('bcrypt');
const { response } = require("../app");
const ObjectId = require('mongodb').ObjectId
// const razorpay=req
const Razorpay = require('razorpay');
const razorpay = require('../thirdparty/razorpay')


const otp = require('../thirdparty/otp');
const { log } = require("console");

const client = require('twilio')(otp.accountId, otp.authToken)

let number
var instance = new Razorpay({
  key_id: razorpay.id,
  key_secret: razorpay.secret_id
});
// razorpay instance

module.exports = {
  doSignUp: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {

      try {
        email = userData.email;
        existingUser = await user.user.findOne({ email })
        if (existingUser) {
          response = { emailStatus: true }
          resolve(response)

        }
        else {
          var hashedPassword = await bcrypt.hash(userData.password, 10);
          const data = new user.user({

            username: userData.username,
            Password: hashedPassword,
            email: userData.email,
            phonenumber: userData.phonenumber,
          })
          console.log(data);
          await data.save(data).then((data) => {
            resolve({ data, emailStatus: false })
          })
        }
      }

      catch (err) {
        console.log(err);
      }


    })



  },
  doLogin: (userData) => {

    return new Promise(async (resolve, reject) => {
      try {
        let response = {}
        let users = await user.user.findOne({ email: userData.email })
        if (users) {
          if (users.blocked == false) {
            await bcrypt.compare(userData.password, users.Password).then((status) => {
              if (status) {
                id = users._id
                console.log(id + "hhhhh");
                userName = users.username

                resolve({ id, response, loggedInStatus: true })
              } else {
                resolve({ loggedInStatus: false })
              }
            })
          }
          else {
            resolve({ blockedStatus: true })
          }


        } else {
          resolve({ loggedInStatus: false })
        }
      } catch (err) {
        console.log(err);
      }
    })


  },
  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      await user.product.find().countDocuments().then((documents) => {

        resolve(documents);
      })
    })
  },


  shopListProduct: (pageNum) => {
    console.log("hi");

    let perPage = 6
    return new Promise(async (resolve, reject) => {



      await user.product.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {
        console.log(response);

        resolve(response)
      })
      // console.log(response)


    })
  },
  productDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.find({ _id: proId }).then((response) => {
        // console.log(response);
        resolve(response)
      })
    })
  },
  addToCart: (proId, userId) => {
    console.log(proId);
    console.log(userId);
    proObj = {
      productId: proId,
      Quantity: 1

    }
    return new Promise(async (resolve, reject) => {

      console.log("kri");
      let carts = await user.cart.findOne({ user: userId })
      if (carts) {
        console.log("cart already exist");

        let productExist = carts.cartItems.findIndex(cartItems => cartItems.productId == proId)
        // console.log(cartItems);
        console.log(productExist);
        if (productExist != -1) {

          user.cart.updateOne({ 'user': userId, 'cartItems.productId': proId }, {
            $inc: { 'cartItems.$.Quantity': 1 }
          }).then(() => {
            resolve()
          })
        } else {
          console.log("elsehi");
          await user.cart.updateOne({ user: userId },
            {
              "$push":
              {
                "cartItems": proObj

              }
            }).then((response) => {

              console.log(proId);
              console.log(response);

              resolve(response)
            })


        }
      } else {
        console.log("else keri");
        let cartItems = new user.cart({
          user: userId,

          cartItems: proObj

        })
        console.log(cartItems + "proid");
        await cartItems.save().then((data) => {
          console.log(data);

          resolve(data)
        });



      }
    })

  },
  viewCart: (userId) => {

    console.log(userId + "view");
    return new Promise(async (resolve, reject) => {


      const id = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {

            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity'
          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'carted'
          }
        },
        {
          $project: {
            item: 1,
            quantity: 1,
            cartItems: { $arrayElemAt: ['$carted', 0] }
          }
        }
      ]).then((cartItems) => {
        console.log(cartItems)


        resolve(cartItems)


      })


    })
  },

  category: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      await user.product.find({ category: categoryName }).then((response) => {
        resolve(response)
      })
    })

  },

  getCartItemsCount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await user.cart.findOne({ user: userId })
      console.log(cart);
      if (cart) {
        count = cart.cartItems.length
      }
      resolve(count)
      console.log(count);
    })



  },
  changeProductQuantity: (data) => {
    console.log(data);
    count = parseInt(data.count)
    quantity = parseInt(data.quantity)
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {
        console.log("ifhi");
        user.cart.updateOne({ '_id': data.cart }, {
          $pull: { cartItems: { productId: data.product } }
        }).then(() => {
          resolve({ removeProduct: true })

        })

      }
      else {
        console.log("else hi");
        user.cart.updateOne({ '_id': data.cart, 'cartItems.productId': data.product }, {
          $inc: { 'cartItems.$.Quantity': count }
        }).then(() => {
          resolve({ status: true })
        })
      }







    })


  },
  totalCheckOutAmount: (userId) => {

    return new Promise(async (resolve, reject) => {


      const total = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {
            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity'
          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'carted'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$carted', 0] }
          }

        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$product.Price"] } }
          }
        }
      ]).then((total) => {



        resolve(total[0]?.total)


      })

    })

  },
  deleteCart: (data) => {
    return new Promise((resolve, reject) => {

      user.cart.updateOne({ '_id': data.cartId },
        {
          "$pull": { cartItems: { productId: data.product } }
        }
      ).then(() => {
        resolve({ removeProduct: true })
      })

    })
  },
  getCardProdctList: (userId) => {
    return new Promise(async (resolve, reject) => {


      let id = user.cart.aggregate([

        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$cartItems'
        },

        {
          $project: {
            item: '$cartItems.productId',
            _id: 0
          }
        },

      ]).then((result) => {
        console.log(result);
        resolve(result)
      })

    })




  },
  checkOutpage: (userId) => {
    return new Promise(async (resolve, reject) => {

      await user.address.aggregate([
        {
          $match: {
            userid: ObjectId(userId)
          }
        },
        {
          $unwind: '$Address'
        },

        {
          $project: {
            item: '$Address'

          }
        },

        {
          $project: {
            item: 1,
            Address: { $arrayElemAt: ['$Address', 0] }
          }
        }

      ]).then((address) => {


        resolve(address)
      })


    })
  },
  placeOrder: (orderData, total) => {
    console.log(orderData.address);
    console.log("_______________________________________________________________________________");
    console.log(orderData.user);
    return new Promise(async (resolve, reject) => {

      let productdetails = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {
            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity',

          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'productdetails'
          }
        },
        {
          $unwind: '$productdetails'
        },

        {
          $project: {
            image: '$productdetails.Image',
            category: '$productdetails.category',
            _id: "$productdetails._id",
            quantity: 1,
            productsName: "$productdetails.Productname",
            productsPrice: "$productdetails.Price",

          }
        }
      ])

      console.log(productdetails + "product")

      let Address = await user.address.aggregate([
        { $match: { userid: ObjectId(orderData.user) } },
        { $unwind: "$Address" },
        { $match: { 'Address._id': ObjectId(orderData.address) } },
        { $unwind: "$Address" },
        {
          $project: {
            item: "$Address"
          }
        },
      ])
      console.log(Address);
      const items = Address.map(obj => obj.item);
      console.log(items[0]);
      let orderaddress = items[0]
      let status = orderData['payment-method'] === 'COD' ? 'placed' : 'pending'
      let orderstatus = orderData['payment-method'] === 'COD' ? 'success' : 'pending'
      let orderdata = {

        name: orderaddress.fname,
        paymentStatus: status,
        paymentmode: orderData['payment-method'],
        // paymenmethod: orderData['payment-method'],
        productDetails: productdetails,
        shippingAddress: orderaddress,
        orderStatus: orderstatus,
        totalPrice: total

      }


      let order = await user.order.findOne({ userid: orderData.user })

      if (order) {
        await user.order.updateOne({ userid: orderData.user },
          {
            '$push':
            {
              'orders': orderdata
            }
          }).then((productdetails) => {

            resolve(productdetails)
          })
      } else {
        let newOrder = user.order({
          userid: orderData.user,
          orders: orderdata
        })

        await newOrder.save().then((orders) => {
          resolve(orders)
        })
      }
      await user.cart.deleteMany({ user: orderData.user }).then(() => {
        resolve()
      })

    })
  },
  generateRazorpay: (userId, total) => {
    console.log(userId, total);

    return new Promise(async (resolve, reject) => {

      let orders = await user.order.find({ userid: userId })
      console.log("before" + orders);
      let order = orders[0].orders.slice().reverse()
      console.log(order);
      let orderId = order[0]._id
      console.log(orderId + "______________________________");
      total = total * 100
      console.log(total);
      var options = {
        amount: Number(total),
        currency: "INR",
        receipt: "" + orderId,
      }
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log('_________________________');
          console.log(err);
        } else {
          // console.log('new order:',order);


          resolve(order)
          console.log(order);
        }
      })

    })
  },
  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('hlo');
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', razorpay.secret_id)
        hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]']) {

          resolve()
        } else {
          reject("not match")
        }
      } catch (err) {
        console.log(err)
      }
    })



  },
  changePaymentStatus: (userId, orderId) => {

    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      try {
        //  await user.order.findOne({'orders._id':orderId},{'orders.$':1})


        let users = await user.order.updateOne(
          { 'orders._id': orderId },
          {
            $set: {
              'orders.$.orderStatus': 'success',
              'orders.$.paymentStatus': 'paid'
            }
          }
        )
        await user.cart.deleteMany({ user: userId });
        resolve();

      } catch (err) {
        console.log(err)

      }
    });
  },
  postAddress: (userId, data) => {
    console.log('hlo');
    return new Promise(async (resolve, reject) => {

      let addressInfo = {
        fname: data.fname,
        lname: data.lname,
        street: data.street,
        apartment: data.apartment,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        mobile: data.mobile,
        email: data.email,

      }



      let AddressInfo = await user.address.findOne({ userid: userId })
      if (AddressInfo) {


        await user.address.updateOne({ userid: userId },
          {
            "$push":
            {
              "Address": addressInfo

            }
          }).then((response) => {
            console.log(response);
            resolve(response)
          })



      } else {


        let addressData = new user.address({
          userid: userId,

          Address: addressInfo

        })

        await addressData.save().then((response) => {
          console.log(response);
          resolve(response)
        });
      }
    })

  },
  orderPage: (userId) => {
    return new Promise(async (resolve, reject) => {

      await user.order.aggregate([{
        $match:
          { userid: ObjectId(userId) }
      },
      {
        $unwind: '$orders'
      },
      {
        $sort: { 'orders:createdAt': -1 }
      }
      ]).then((response) => {
        console.log(response);
        resolve(response)
      })
    })

  },
  viewOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {

  let productid = await user.order.findOne({ "orders._id": orderId },{'orders.$':1})
   
   let details=productid.orders[0]
   let order=productid.orders[0].productDetails
 
   const productDetails = productid.orders.map(object => object.productDetails);
   const address= productid.orders.map(object => object.shippingAddress);
   const products = productDetails.map(object => object)
     
        resolve({products,address, details,})
      
    
           
    })



  },
  cancelOrder: (orderId, userId) => {

    console.log('orderId', orderId);
    console.log(userId);
    return new Promise(async (resolve, reject) => {

      let orders = await user.order.find({ 'orders._id': orderId })
      console.log('match---', orders);

    

      let orderIndex = orders[0].orders.findIndex(orders => orders._id == orderId)
      console.log(orderIndex);

      await user.order.updateOne({ 'orders._id': orderId },
        {
          $set:
          {
            ['orders.' + orderIndex + '.orderStatus']: 'cancelled'

          }


        }).then((orders) => {
          console.log(orders);
          resolve(orders)
        })

    })


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
                total=total-discountAmount
                resolve({ status: true, discountAmount: discountAmount,total:total });
              } else {
                total=total-discountAmount
                resolve({ status: true, discountAmount: discountAmount ,total:total});
              }
            } else {
              console.log("ded1");
              resolve({
                status: false,
                reason: `Minimum purchase value is ${coupon.minPurchase}`,
              });
            }
          } else {
            console.log("ded2");
            resolve({ status: false, reason: "coupon Expired" });
          }
        }
      } catch (error) {
        console.log(error);
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
        console.log(usedCoupon.length);
        if (usedCoupon.length == 1) {
          resolve({ status: true });
          console.log("hii");
        }
        //  else {
        //   console.log("hello");
        //   resolve({ status: false, reason: "coupon is already Used" });
        // }
      } catch (err) {
        console.log(err);
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
        console.log(error);
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

  // deleteCart:(prodId)=>{
  //   return new Promise(async(resolve, reject) => {
  //     await user.cart.updateOne({ '_id':prodId  }, {
  //       $pull:{cartItems:{productId:}}
  //     }).then(()=>{
  //       resolve({removeProduct:true})

  //     })
  //   })

  // },







}
