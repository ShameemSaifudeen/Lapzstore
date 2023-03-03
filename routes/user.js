var express = require("express");
var router = express.Router();
const controllers = require('../controllers/user/usercontroller')
const middleware = require('../middlewares/middleware')

router.get("/", controllers.getHome)

router.get("/login", middleware.userSession, controllers.getUserLogin)

router.post("/login", controllers.postUserLogin)

router.get("/otp_login", controllers.getUserOtpLogin)

router.post("/otp_login", controllers.postUserOtpLogin)

router.get('/otp_verify', controllers.getOtpVerify)

router.post('/otp_verify', controllers.postOtpVerify)

router.get("/signup", controllers.getSignUp)

router.post("/signup", controllers.postSignUp)

router.get('/profile',middleware.userSession,middleware.isUserBlock,controllers.getProfile)

router.put('/update_profile',middleware.userSession,controllers.updateProfile)

router.get('/reset_password',middleware.userSession,middleware.isUserBlock,controllers.resetPassword)

router.post("/update_password",middleware.userSession,controllers.updatePassword)

router.get('/view_address',middleware.userSession,middleware.isUserBlock,controllers.getAddress)

router.delete('/delete_address',middleware.userSession,middleware.isUserBlock,controllers.deleteAddress)

// router.get("/shop", middleware.userSession, controllers.getShop)

router.get("/logout", middleware.userSession, controllers.getLogout)

router.get('/shop', middleware.userSession, middleware.isUserBlock,controllers.getShop)

router.get('/product_details/:id', middleware.userSession,middleware.isUserBlock, controllers.getProductDetails)

router.get('/add_to_cart/:id', middleware.userSession, middleware.isUserBlock,controllers.getAddToCart)

router.get('/view_cart', middleware.userSession,middleware.isUserBlock, controllers.getViewCart)

router.put('/change_product_quantity', middleware.userSession, controllers.postchangeProductQuantity)

router.delete('/delete_cart_item', middleware.userSession,middleware.isUserBlock, controllers.getDeleteCart)


router.get('/add_to_wishlist',middleware.userSession,middleware.isUserBlock,controllers.wishList)

router.get('/wishlist',middleware.userSession,middleware.isUserBlock,controllers.ListWishList)

router.delete('/delete_wishlist',middleware.userSession,controllers.deleteWishList)






router.get("/check_out", middleware.userSession,middleware.isUserBlock, controllers.checkOutPage)

router.post("/check_out", middleware.userSession, controllers.postcheckOutPage)

router.post('/verify_payment', middleware.userSession, controllers.postVerifyPayment)

router.get('/order', middleware.userSession,middleware.isUserBlock, controllers.getOrderPage)

router.put('/cancel_order', middleware.userSession, controllers.getCancelOrder)

router.put('/return_order', middleware.userSession, controllers.putReturnOrder)

router.get('/order_details',middleware.userSession,middleware.isUserBlock,controllers.orderDetails)

router.get('/order_success',middleware.userSession,middleware.isUserBlock,controllers.orderSucess)

router.get("/add_address", middleware.userSession,middleware.isUserBlock, controllers.getAddresspage)

router.post('/add_address', middleware.userSession, controllers.postAddresspage)

router.post("/apply_coupon", middleware.userSession, controllers.applyCoupon);

router.get("/coupon_validator",middleware.userSession, controllers.couponValidator);

router.get("/coupon_verify", middleware.userSession, controllers.couponVerify);

router.get('/category', middleware.userSession,middleware.isUserBlock, controllers.category)

router.post('/search',middleware.userSession, controllers.getSearch)

router.post('/sort',middleware.userSession, controllers.postSort)


module.exports = router;
