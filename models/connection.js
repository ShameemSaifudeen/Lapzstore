const mongoose = require("mongoose");
const { MessagingConfigurationInstance } = require("twilio/lib/rest/verify/v2/service/messagingConfiguration");
const db = mongoose
  .connect("mongodb://0.0.0.0:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));





const userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  Password: {
    type: String,
    required: true,
    // minlength: 5,

  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: Number,
    // minlength:10,
    unique: true,
  },
  blocked: {
    type: Boolean, default: false
  },
  coupons: { type: Array },
  CreatedAt: {
    type: Date,
    deafault: Date.now,
  },
})


const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,


  }
})

const productSchema = new mongoose.Schema({
  Productname: {
    type: String
  },
  ProductDescription: {
    type: String
  },
  Quantity: {
    type: Number
  },
  Image: {
    type: Array,


  },
  Price: {
    type: Number
  },
  productActive: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String
  },
  productActive: {
    type: Boolean,
    default: true,
  }


})
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },

    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
        Quantity: { type: Number, default: 1 },
        Price: { type: Number }
      }
    ],

  }
)
const addressSchema = new mongoose.Schema({


  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  Address: [
    {
      fname: { type: String },
      lname: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String }
    }
  ]


})
const orderSchema = new mongoose.Schema({

  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  orders: [{


    name: String,
    productDetails: Array,
    paymentMethod: String,
    paymentStatus: String,
    totalPrice: Number,
    totalQuantity: Number,
    shippingAddress: Object,
    paymentmode: String,
    status: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    orderStatus: {
      type: String
    },
  }
  ]
})
const couponSchema = new mongoose.Schema({
  couponName: String,
  expiry: {
    type: Date,
    default: new Date(),
  },
  minPurchase: Number,
  discountPercentage: Number,
  maxDiscountValue: Number,
  description: String,
  createdAt: {
    type: Date,
    default: new Date(),
  },
});
const wishSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  wishitems: [{
    productId: { type: mongoose.Schema.Types.ObjectId },
  }],
  addedAt: {
    type: Date,
    default: Date.now
  }
});
const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  // positi: {
  //   type: String,
  //   required: true
  // },
});
//  module.exports=db



module.exports = {
  user: mongoose.model('user', userschema),
  categories: mongoose.model('categories', categorySchema),
  product: mongoose.model('product', productSchema),
  cart: mongoose.model('cart', cartSchema),
  order: mongoose.model('order', orderSchema),
  address: mongoose.model('address', addressSchema),
  coupon: mongoose.model("coupon", couponSchema),
  wishlist: mongoose.model("wishlist", wishSchema),
  banner: mongoose.model("banner",bannerSchema)

}

