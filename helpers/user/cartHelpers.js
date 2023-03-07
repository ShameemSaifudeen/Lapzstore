const db = require("../../models/connection");

const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId


module.exports = {
  addToCart: (proId, userId) => {

    proObj = {
      productId: proId,
      Quantity: 1

    }
    return new Promise(async (resolve, reject) => {


      let carts = await db.cart.findOne({ user: userId })
      if (carts) {


        let productExist = carts.cartItems.findIndex(cartItems => cartItems.productId == proId)

        if (productExist != -1) {

          db.cart.updateOne({ 'user': userId, 'cartItems.productId': proId }, {
            $inc: { 'cartItems.$.Quantity': 1 }
          }).then(() => {
            resolve()
          })
        } else {

          await db.cart.updateOne({ user: userId },
            {
              "$push":
              {
                "cartItems": proObj

              }
            }).then((response) => {


              resolve(response)
            })


        }
      } else {

        let cartItems = new db.cart({
          user: userId,

          cartItems: proObj

        })

        await cartItems.save().then((data) => {


          resolve(data)
        });



      }
    })

  },
  viewCart: (userId) => {


    return new Promise(async (resolve, reject) => {


      const id = await db.cart.aggregate([
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



        resolve(cartItems)


      })


    })
  },



  getCartItemsCount: (userId) => {

    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db.cart.findOne({ user: userId })

      if (cart) {
        count = cart.cartItems.length
      }
      resolve(count)

    })



  },
  changeProductQuantity: (data) => {

    count = parseInt(data.count)
    quantity = parseInt(data.quantity)
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {

        db.cart.updateOne({ '_id': data.cart }, {
          $pull: { cartItems: { productId: data.product } }
        }).then(() => {
          resolve({ removeProduct: true })

        })

      }
      else {

        db.cart.updateOne({ '_id': data.cart, 'cartItems.productId': data.product }, {
          $inc: { 'cartItems.$.Quantity': count }
        }).then(() => {
          resolve({ status: true })
        })
      }







    })


  },
  totalCheckOutAmount: (userId) => {

    return new Promise(async (resolve, reject) => {


      const total = await db.cart.aggregate([
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

      db.cart.updateOne({ '_id': data.cartId },
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


      let id = db.cart.aggregate([

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

        resolve(result)
      })

    })




  },
}