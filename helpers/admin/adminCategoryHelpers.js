const { response } = require("express");
const db = require("../../models/connection");
const voucher_codes = require("voucher-code-generator");

module.exports = {
    addCategory: (data) => {
        let response = {};

        return new Promise(async (resolve, reject) => {
            let category = data.categoryname;
            existingCategory = await db.categories.findOne({
                categoryName: category,
            });
            if (existingCategory) {
                response = { categoryStatus: true };
                resolve(response);
            } else {
                const categoryData = new db.categories({
                    categoryName: data.categoryname,
                });
                await categoryData.save().then((data) => {
                    resolve(data);
                });
            }
        });
    },
    viewAddCategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.categories
                .find()
                .exec()
                .then((response) => {
                    resolve(response);
                });
        });
    },
    deleteCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            await db.categories.deleteOne({ _id: categoryId }).then((response) => {
                resolve(response);
            });
        });
    },
    editCategory: (categoryId, editedName) => {
        return new Promise(async (resolve, reject) => {
            await db.categories
                .updateOne(
                    { _id: categoryId },
                    {
                        $set: {
                            categoryName: editedName,
                        },
                    }
                )
                .then(() => {
                    resolve();
                });
        });
    },
    findCategory: (categoryId) => {
        return new Promise(async (resolve, reject) => {
            await db.categories
                .find({ _id: categoryId })
                .exec()
                .then((data) => {
                    resolve(data[0]);
                });
        });
    },
    findAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.categories
                .find()
                .exec()
                .then((data) => {
                    resolve(data);
                });
        });
    },
}