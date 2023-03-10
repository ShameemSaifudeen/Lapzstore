const { response } = require("express");
const db = require("../../models/connection");
const voucher_codes = require("voucher-code-generator");

module.exports = {
  AddProduct: (userdata, filename) => {
    return new Promise((resolve, reject) => {
      ImageUpload = new db.product({
        Productname: userdata.name,
        ProductDescription: userdata.description,
        Quantity: userdata.quantity,
        Image: filename,
        category: userdata.category,
        Price: userdata.price,
      });
      ImageUpload.save().then((data) => {
        resolve(data);
      });
    });
  },
  ViewProduct: (pageNum,perPage) => {

    return new Promise(async (resolve, reject) => {
      await db.product
        .find()
        .skip((pageNum - 1) * perPage).limit(perPage)
        .then((response) => {
          resolve(response);
        });
    });
  },
  countProduct: () => {

    return new Promise(async (resolve, reject) => {
      await db.product
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  listProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.product
        .updateOne({ _id: prodId }, { $set: { productActive: true } })
        .then(() => {
          resolve();
        });
    });
  },
  unlistProduct: (prodId) => {
    return new Promise(async (resolve, reject) => {
      await db.product
        .updateOne({ _id: prodId }, { $set: { productActive: false } })
        .then(() => {
          resolve();
        });
    });
  },
  deleteViewProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.deleteOne({ _id: productId }).then((response) => {
        resolve(response);
      });
    });
  },
  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.product
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },
  postEditProduct: (productId, editedData, images) => {
    return new Promise(async (resolve, reject) => {
      await db.product
        .updateOne(
          { _id: productId },
          {
            $set: {
              Productname: editedData.name,
              ProductDescription: editedData.description,
              Quantity: editedData.quantity,
              Price: editedData.price,
              category: editedData.category,
              Image: images,
            },
          }
        )
        .then((response) => {
          resolve(response);
        }).catch((err)=>{
          reject(err)
        })
    });
  },
}