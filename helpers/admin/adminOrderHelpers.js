const db = require('../../models/connection')
const { response } = require("express");
const voucher_codes = require("voucher-code-generator");
module.exports = {
    orderPage: () => {
        return new Promise(async (resolve, reject) => {
            await db.order
                .aggregate([
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

    // view order users order details

    orderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.order.findOne(
                { "orders._id": orderId },
                { "orders.$": 1 }
            );
            resolve(order);
        });
    },

    // change order status

    changeOrderStatus: (orderId, data) => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.order.findOne(
                { "orders._id": orderId },
                { "orders.$": 1 }
            );

            let users = await db.order.updateOne(
                { "orders._id": orderId },
                {
                    $set: {
                        "orders.$.orderStatus": data.status,
                    },
                }
            );
            resolve(response);
        });
    },

    // dashboard

    getOrderByDate: () => {
        return new Promise(async (resolve, reject) => {
            const startDate = new Date("2022-01-01");
            await db.order
                .find({ createdAt: { $gte: startDate } })
                .then((response) => {
                    resolve(response);
                });
        });
    },

    // get all orders

    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let order = await db.order
                .aggregate([{ $unwind: "$orders" }])
                .then((response) => {
                    resolve(response);
                });
        });
    },
    getCodCount: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.order.aggregate([
                {
                    $unwind: "$orders",
                },
                {
                    $match: {
                        "orders.paymentmode": "COD",
                    },
                },
            ]);
            resolve(response);
        });
    },

    getOnlineCount: () => {
        return new Promise(async (resolve, reject) => {
            let response = await db.order.aggregate([
                {
                    $unwind: "$orders",
                },
                {
                    $match: {
                        "orders.paymentmode": "online",
                    },
                },
            ]);
            resolve(response);
        });
    },
    getSalesReport: async () => {
        
        return new Promise(async (resolve, reject) => {
            let response = await db.order.aggregate([
                {
                    $unwind: "$orders",
                },
                {
                    $match: {
                        "orders.orderStatus": "Delivered",
                    },
                },
            ]);

            resolve(response);
        });
    },
    postReport: (date) => {
        let start = new Date(date.startdate);
        let end = new Date(date.enddate);

        return new Promise(async (resolve, reject) => {
            await db.order
                .aggregate([
                    {
                        $unwind: "$orders",
                    },
                    {
                        $match: {
                            $and: [
                                { "orders.orderStatus": "Delivered" },
                                { "orders.createdAt": { $gte: start, $lte: end } },
                            ],
                        },
                    },
                ])
                .exec()
                .then((response) => {
                    resolve(response);
                });
        });
    },
    gettotalamount: () => {
        return new Promise(async (resolve, reject) => {
            await db.order
                .aggregate([
                    {
                        $unwind: "$orders",
                    },
                    {
                        $match: {
                            "orders.orderStatus": "Delivered",
                        },
                    },
                    {
                        $project: {
                            productDetails: "$orders.productDetails",
                        },
                    },
                    {
                        $unwind: "$productDetails",
                    },

                    {
                        $project: {
                            price: "$productDetails.productsPrice",
                            quantity: "$productDetails.quantity",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: ["$price", "$quantity"] } },
                        },
                    },
                ])
                .then((total) => {
                    if(total.length){

                        resolve(total[0]?.total);
                    }
                    else{
                        resolve()
                    }
                }).catch((err)=>{
                    reject(err)
                });
        });
    },
    getTotalAmount: (date) => {
        let start = new Date(date.startdate);
        let end = new Date(date.enddate);
        return new Promise(async (resolve, reject) => {
            await db.order
                .aggregate([
                    {
                        $unwind: "$orders",
                    },
                    {
                        $match: {
                            $and: [
                                { "orders.orderStatus": "Delivered" },
                                { "orders.createdAt": { $gte: start, $lte: end } },
                            ],
                        },
                    },
                    {
                        $project: {
                            productDetails: "$orders.productDetails",
                        },
                    },
                    {
                        $unwind: "$productDetails",
                    },

                    {
                        $project: {
                            price: "$productDetails.productsPrice",
                            quantity: "$productDetails.quantity",
                        },
                    },
                    {
                        $group: {
                            _id: 0,
                            total: { $sum: { $multiply: ["$price", "$quantity"] } },
                        },
                    },
                ])
                .then((total) => {
                    resolve(total[0]?.total);
                });
        });
    },

}