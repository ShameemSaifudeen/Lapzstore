const db = require("../../models/connection");
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId



module.exports={
    checkOutpage: (userId) => {
        return new Promise(async (resolve, reject) => {
    
          await db.address.aggregate([
            {
              $match: {
                userid: ObjectId(userId)
              }
            },
            {
              $unwind: '$Address'
            },
    
            {
              $project: {
                item: '$Address'
    
              }
            },
    
            {
              $project: {
                item: 1,
                Address: { $arrayElemAt: ['$Address', 0] }
              }
            }
    
          ]).then((address) => {
    
    
            resolve(address)
          })
    
    
        })
      },
      postAddress: (userId, data) => {
       
        return new Promise(async (resolve, reject) => {
    
          let addressInfo = {
            fname: data.fname,
            lname: data.lname,
            street: data.street,
            apartment: data.apartment,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            mobile: data.mobile,
            email: data.email,
    
          }
    
    
    
          let AddressInfo = await db.address.findOne({ userid: userId })
          if (AddressInfo) {
    
    
            await db.address.updateOne({ userid: userId },
              {
                "$push":
                {
                  "Address": addressInfo
    
                }
              }).then((response) => {
               
                resolve(response)
              })
    
    
    
          } else {
    
    
            let addressData = new db.address({
              userid: userId,
    
              Address: addressInfo
    
            })
    
            await addressData.save().then((response) => {
           
              resolve(response)
            });
          }
        })
    
      },
      deleteAddress: (Id) => {
     
        return new Promise((resolve, reject) => {
            db.address
            .updateOne(
              { _id: Id.deleteId },
              {
                $pull: { Address: { _id: Id.addressId } },
              }
            )
            .then((response) => {
              resolve({ deleteAddress: true });
            });
        });
      },
}