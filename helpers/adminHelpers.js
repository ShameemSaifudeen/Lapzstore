const { response } = require("express");
const user = require("../models/connection");
const voucher_codes = require("voucher-code-generator");



module.exports = {
  getUsers: () => {
    console.log(user);
    return new Promise(async (resolve, reject) => {
      let userDatas = []
      await user.user.find().exec().then(result => {
        userDatas = result
      })
      console.log(userDatas);
      resolve(userDatas)
    })
  },
  UnblockUser: (userID) => {
    console.log(userID);
    return new Promise(async (resolve, reject) => {
      await user.user.updateOne({ _id: userID }, { $set: { blocked: false } })
        .then((data) => {
          console.log('Data updated');
          resolve()
        })

    })

  },
  blockUser: (userID) => {
    console.log(userID);
    return new Promise(async (resolve, reject) => {

      await user.user.updateOne({ _id: userID }, { $set: { blocked: true } })
        .then((data) => {
          console.log('Data updated');
          resolve()
        })



    })

  },
  addCategory: (data) => {
    let response = {};

    return new Promise(async (resolve, reject) => {
      let category = data.categoryname;
      existingCategory = await user.categories.findOne({ categoryName: category })
      if (existingCategory) {
        console.log("category exists");
        response = { categoryStatus: true }
        resolve(response)
      }
      else {
        console.log("category not exist");
        const categoryData = new user.categories({

          categoryName: data.categoryname
        })
        console.log(categoryData);
        await categoryData.save().then((data) => {
          console.log(data);
          resolve(data)
        })
      }

    })
  },
  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await user.categories.find().exec().then((response) => {
        resolve(response)
      })

    })

  },
  deleteCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await user.categories.deleteOne({ _id: categoryId }).then((response) => {

        resolve(response)
      })

    })

  },
  editCategory: (categoryId, editedName) => {

    return new Promise(async (resolve, reject) => {
      await user.categories.updateOne({ _id: categoryId }, {
        $set: {
          categoryName: editedName

        }
      })
        .then(() => {
          console.log('Data updated');
          resolve()
        })

    })
  },
  findCategory: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await user.categories.find({ _id: categoryId }).exec().then((data) => {

        resolve(data[0])
      })
    })
  },
  findAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      await user.categories.find().exec().then((data) => {

        console.log(data);

        resolve(data)
      })
    })
  },
  AddProduct: (userdata, filename) => {
    return new Promise((resolve, reject) => {
      // console.log(req.body);
      // console.log(req.file.filename);

      ImageUpload = new user.product({
        Productname: userdata.name,
        ProductDescription: userdata.description,
        Quantity: userdata.quantity,
        Image: filename,
        category: userdata.category,
        Price: userdata.price

      })
      ImageUpload.save().then((data) => {
        //   console.log(data);
        resolve(data)

      })
    })


  },
  ViewProduct: () => {

    return new Promise(async (resolve, reject) => {
      await user.product.find().exec().then((response) => {
        console.log(response);
        resolve(response)

      })
    })

  },
  listProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .updateOne({ _id: prodId }, { $set: { productActive: true } })
        .then(() => {

          resolve();
        });
    });
  },
  unlistProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await user.product
        .updateOne({ _id: prodId }, { $set: { productActive: false } })
        .then(() => {

          resolve();
        });
    });
  },
  deleteViewProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.deleteOne({ _id: productId }).then((response) => {
        resolve(response)
      })
    })
  },
  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.findOne({ _id: productId }).exec().then((response) => {
        resolve(response)
        console.log(response);
      })
    })
  },
  postEditProduct: (productId, editedData, filename) => {
    return new Promise(async (resolve, reject) => {
      console.log(editedData);
      await user.product.updateOne({ _id: productId }, {
        $set: {
          Productname: editedData.name,
          ProductDescription: editedData.description,
          Quantity: editedData.quantity,
          Price: editedData.price,
          category: editedData.category,
          Image: filename
        }
      }).then((response) => {

        resolve(response)
      })
    })
  },
  generateCoupon: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponCode = voucher_codes.generate({
          length: 6,
          count: 1,
          charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          prefix: "LAPZCART-",
        });
        resolve({ status: true, couponCode: couponCode[0] });
      } catch (err) {
        console.log(err);
      }
    });
  },
  addNewCoupon: () => {
    return new Promise((resolve, reject) => {
      try {
        user.coupon(data)
          .save()
          .then(() => {
            resolve({ status: true });
          });
      } catch (error) {
        console.log(error);
      }
    });
  },
  getCoupons: () => {
    return new Promise((resolve, reject) => {
      try {
        user.coupon.find({}).then((data) => {
          resolve(data);
        });
      } catch (error) { }
    });
  },
  deleteCoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      await user.coupon.deleteOne({ _id: couponId }).then((response) => {
        resolve(response);
      });
    });
  },
  orderPage: () => {
    return new Promise(async (resolve, reject) => {

      await user.order.aggregate([
        {
          $unwind: '$orders'
        },
        {
          $sort: { 'orders.createdAt': -1 }
        }
      ]).then((response) => {
        console.log(response);
        resolve(response)

      })
    })

  },

  // view order users order details



  orderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {

      let order = await user.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })
      console.log(order + '----------------------------------------------------------------');
      resolve(order)
    })

  },

  // change order status

  changeOrderStatus: (orderId, data) => {
    console.log(orderId);
    return new Promise(async (resolve, reject) => {
      let orders = await user.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })
      console.log(orders);

      let users = await user.order.updateOne(
        { 'orders._id': orderId },
        {
          $set: {
            'orders.$.orderStatus': data.status,

          }
        }
      )
      resolve(response)
    })

  },


  // dashboard

  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = new Date('2022-01-01');
      await user.order.find({ createdAt: { $gte: startDate } }).then((response) => {
        console.log(response);
        console.log("===============orderby date===================");
        resolve(response)

      })
    });
  },

  // get all orders 

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let order = await user.order.aggregate([
        { $unwind: '$orders' },

      ]).then((response) => {
        resolve(response)
      })

    })
  },
  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.paymentmode": "COD"
          }
        },
      ])
      resolve(response)
    })
  },


  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.paymentmode": "online"
          }
        },
      ])
      resolve(response)
    })
  },

  totalUserCount: () => {

    return new Promise(async (resolve, reject) => {
      let response = await user.user.find().exec()

      resolve(response)

    })
  },
  getSalesReport: async () => {
    return new Promise(async (resolve, reject) => {
      let response = await user.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.orderStatus": "Delivered"
          }
        },
      ])

      resolve(response)
    })
  },
  postReport: (date) => {
    let start = new Date(date.startdate);
    let end = new Date(date.enddate);

    return new Promise(async (resolve, reject) => {
      await user.order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $match: {
            $and: [
              { "orders.orderStatus": "Delivered" },
              { "orders.createdAt": { $gte: start, $lte: end } }

            ]
          }
        }
      ])
        .exec()
        .then((response) => {
          console.log(response);
          resolve(response)
        })
    })

  },
  gettotalamount: () => {
    return new Promise(async (resolve, reject) => {


      await user.order.aggregate([

        {
          $unwind: '$orders'
        },
        {
          $match: {
            "orders.orderStatus": "Delivered"
          }
        },
        {
          $project: {
            productDetails: '$orders.productDetails',

          }

        },
        {
          $unwind: '$productDetails'
        },

        {
          $project: {
            price: '$productDetails.productsPrice',
            quantity: '$productDetails.quantity'
          }
        },


        // {
        //   $lookup: {
        //     from: 'products',
        //     localField: "item",
        //     foreignField: "_id",
        //     as: 'carted'
        //   }
        // },
        // {
        //   $project: {
        //     item: 1, quantity: 1, product: { $arrayElemAt: ['$carted', 0] }
        //   }

        // },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$price", "$quantity"] } }
          }
        }
      ]).then((total) => {


        resolve(total[0].total)
        console.log(total[0].total, '------------------------------');


      })

    })

  },
  getTotalAmount: (date) => {
    let start = new Date(date.startdate);
    let end = new Date(date.enddate);
    return new Promise(async (resolve, reject) => {


      await user.order.aggregate([

        {
          $unwind: '$orders'
        },
        {
          $match: {
            $and: [
              { "orders.orderStatus": "Delivered" },
              { "orders.createdAt": { $gte: start, $lte: end } }

            ]
          }
        },
        {
          $project: {
            productDetails: '$orders.productDetails',

          }

        },
        {
          $unwind: '$productDetails'
        },

        {
          $project: {
            price: '$productDetails.productsPrice',
            quantity: '$productDetails.quantity'
          }
        },


        // {
        //   $lookup: {
        //     from: 'products',
        //     localField: "item",
        //     foreignField: "_id",
        //     as: 'carted'
        //   }
        // },
        // {
        //   $project: {
        //     item: 1, quantity: 1, product: { $arrayElemAt: ['$carted', 0] }
        //   }

        // },
        {
          $group: {
            _id: 0,
            total: { $sum: { $multiply: ["$price", "$quantity"] } }
          }
        }
      ]).then((total) => {


        resolve(total[0].total)
        // console.log(total[0].total[0], '------------------------------');


      })

    })

  },
  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = user.banner({
        title: texts.title,
        description: texts.description,
        link: texts.link,
        image: Image

      })
      await banner.save().then((response) => {
        resolve(response)
      })
    })
  },

  /// list banner
  listBanner: () => {

    return new Promise(async (resolve, reject) => {
      await user.banner.find().exec().then((response) => {
        resolve(response)
      })
    })
  },

  // edit banner

  editBanner: (bannerId) => {

    return new Promise(async (resolve, reject) => {

      let bannerid = await user.banner.findOne({ _id: bannerId }).then((response) => {
        resolve(response)
      })

    })

  },

  //post edit banner

  postEditBanner: (bannerid, texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let response = await user.banner.updateOne({ _id: bannerid },
        {
          $set: {

            title: texts.title,
            description: texts.description,
            // created_at: updated_at,
            link: texts.link,
            image: Image
          }

        })
      resolve(response)
    })

  },
}




