const db = require("../../models/connection");
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId


module.exports = {

  AddToWishList: (proId, userId) => {
    let proObj = {
      productId: proId
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await db.wishlist.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishitems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          db.wishlist.updateOne({ user: userId },
            {
              $addToSet: {
                wishitems: proObj
              },
            }
          )
            .then(() => {
              resolve({ status: true });
            });
        }

      } else {
        const newWishlist = new db.wishlist({
          user: userId,
          wishitems: proObj
        });

        await newWishlist.save().then(() => {
          resolve({ status: true });
        });
      }
    });
  },


  ListWishList: (userId) => {
    return new Promise(async (resolve, reject) => {


      await db.wishlist.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$wishitems'
        },
        {
          $project: {
            item: '$wishitems.productId',
          }
        },
        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'wishlist'
          }
        },
        {
          $project: {
            item: 1, wishlist: { $arrayElemAt: ['$wishlist', 0] }
          }
        },
      ]).then((wishlist) => {
        resolve(wishlist)
      })
    })
  },

  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db.wishlist.findOne({ user: userId })
      if (wishlist) {
        count = wishlist.wishitems.length
      }
      resolve(count)

    })
  },

  // delete wish list 

  deleteWishList: (body) => {

    return new Promise(async (resolve, reject) => {

      let product = await db.wishlist.updateOne({ _id: body.wishlistId },
        {
          "$pull":

            { wishitems: { productId: body.productId } }
        }).then(() => {
          resolve({ removeProduct: true })
        })


    })
  }
  ,

}