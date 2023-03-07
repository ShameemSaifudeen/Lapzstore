const { response } = require("express");
const db = require("../../models/connection");
const voucher_codes = require("voucher-code-generator");

module.exports = {
  getUsers: () => {
    return new Promise(async (resolve, reject) => {
      let userDatas = [];
      await db.user
        .find()
        .exec()
        .then((result) => {
          userDatas = result;
        });
      resolve(userDatas);
    });
  },
  UnblockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userID }, { $set: { blocked: false } })
        .then((data) => {
          resolve();
        });
    });
  },
  blockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
      await db.user
        .updateOne({ _id: userID }, { $set: { blocked: true } })
        .then((data) => {
          resolve();
        });
    });
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
      }
    });
  },
  // dashboa
  totalUserCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await db.user.find().exec();

      resolve(response);
    });
  },

};
