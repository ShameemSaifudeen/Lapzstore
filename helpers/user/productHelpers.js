const db = require("../../models/connection");
const { response } = require("../../app");

module.exports = {
  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      await db.product.find().countDocuments().then((documents) => {

        resolve(documents);
      })
    })
  },
  shopListProduct: (pageNum) => {
    const perPage = 9
    return new Promise(async (resolve, reject) => {
      await db.product.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {
        resolve(response)
      })
    })
  },
  homeListProduct: () => {
    return new Promise(async (resolve, reject) => {
      await db.product.find().exec().then((response) => {
        resolve(response)
      })
    })
  },
  productDetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.find({ _id: proId }).then((response) => {
        resolve(response)
      })
    })
  },
  category: (categoryName) => {
    return new Promise(async (resolve, reject) => {
      await db.product.find({ category: categoryName }).then((response) => {
        resolve(response)
      })
    })
  },
  // search
  productSearch: (searchData) => {
    const keyword = searchData.search
    return new Promise(async (resolve, reject) => {
      try {
        const products = await db.product.find({ Productname: { $regex: new RegExp(keyword, 'i') } });
        if (products.length > 0) {
          resolve(products);
        } else {
          reject('No products found.');
        }
      } catch (err) {
        reject(err);
      }
    });
  },
  postSort: (sortOption) => {
    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === 'price-low-to-high') {
        products = await db.product.find().sort({ Price: 1 }).exec();
      } else if (sortOption === 'price-high-to-low') {
        products = await db.product.find().sort({ Price: -1 }).exec();
      } else {
        products = await db.product.find().exec();
      }
      resolve(products)
    })
  },
}