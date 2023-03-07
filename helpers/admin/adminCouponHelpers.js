const db = require('../../models/connection')
const { response } = require("express");
const voucher_codes = require("voucher-code-generator");

module.exports = {
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
    addNewCoupon: () => {
        return new Promise((resolve, reject) => {
            try {
                db.coupon(data)
                    .save()
                    .then(() => {
                        resolve({ status: true });
                    });
            } catch (error) {
            }
        });
    },
    getCoupons: () => {
        return new Promise((resolve, reject) => {
            try {
                db.coupon.find({}).then((data) => {
                    resolve(data);
                });
            } catch (error) { }
        });
    },
    deleteCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
            await db.coupon.deleteOne({ _id: couponId }).then((response) => {
                resolve(response);
            });
        });
    },
}