var express = require("express");
const { getMaxListeners } = require("../app");
const adminController = require('../controllers/admin/admincontroller')
var router = express.Router();
const user = require("../models/connection");
const multer = require('../multer/multer')
const middleware = require('../middlewares/middleware')

router.get("/", middleware.adminSession, adminController.getDashboard)

router.get("/login", middleware.adminSession, adminController.getAdminLogin);

router.post("/login", adminController.postAdminLogin)

router.get("/logout", adminController.getAdminLogOut)

router.get("/view_users", middleware.adminSession, adminController.getViewUser)

router.get("/block_users/:id", middleware.adminSession, adminController.getBlockUser);

router.get("/unblock_users/:id", middleware.adminSession, adminController.getUnblockUser);

router.get("/add_category", middleware.adminSession, adminController.getCategory)

router.post("/add_category", adminController.postCategory)

router.get("/delete_category/:id", middleware.adminSession, adminController.getDeleteCategory)

router.get("/add_product", middleware.adminSession, adminController.getAddProduct);

router.post("/add_product", multer.uploads, adminController.postAddProduct);

router.get("/view_product", middleware.adminSession, adminController.getViewproduct)

router.get("/edit_product/:id", middleware.adminSession, adminController.editViewProduct)

router.post("/edit_product/:id", multer.editeduploads, adminController.postEditAddProduct)

router.get("/delete_product/:id", middleware.adminSession, adminController.deleteViewProduct)

router.put("/list_product/:id", middleware.adminSession, adminController.listProduct);

router.put("/unlist_product/:id", middleware.adminSession, adminController.unlistProduct);

router.get("/coupons", middleware.adminSession, adminController.coupons);

router.get("/add_coupons", middleware.adminSession, adminController.addCoupons);

router.post("/add_coupons", middleware.adminSession, adminController.addNewCoupon);

router.get("/generate_coupon", middleware.adminSession, adminController.generateCoupon);

router.delete("/coupon_delete/:id", middleware.adminSession, adminController.deleteCoupon);

// router.get('/orders',middleware.adminSession,adminController.getOrders)

router.get("/edit_category/:id", middleware.adminSession, adminController.getEditCategory)

router.post("/edit_category/:id", middleware.adminSession, adminController.postEditCategory)

router.get("/orders_list", middleware.adminSession, adminController.getOrderList)

router.get("/order_details", middleware.adminSession, adminController.getOrderDetails)

router.post("/order_details", middleware.adminSession, adminController.postOrderDetails)

router.get('/sales_report', middleware.adminSession, adminController.getSalesReport)

router.post('/sales_report', adminController.postSalesReport)

router.get("/add_banner", middleware.adminSession, adminController.getAddBanner)

router.post("/add_banner", multer.addBannerupload, middleware.adminSession, adminController.postAddBanner)

router.get("/list_banner", middleware.adminSession, adminController.listBanner)

router.get("/edit_banner", middleware.adminSession, adminController.getEditBanner)

router.post("/edit_banner", multer.editBannerupload, middleware.adminSession, adminController.postEditBanner)

module.exports = router;


















































// router.get('/banners',  adminController.banner)

// router.get('/banner-management',  controllers.bannerPage)

// router.get('/add_banner',  adminController.addBanner)

// router.post('/add-banner', controllers.addbannerPost)

// router.get('/edit-banner/:id',controllers.editBannerPage)

// router.post('/edit-banner/:id',controllers.editBannerPost)

// router.delete('/delete-banner/:id',controllers.deleteBanner)




















// router.get("/add_sub", function (req, res) { res.render("admin/add-subcategory", { layout: "adminLayout" });});