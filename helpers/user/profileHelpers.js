const db = require("../../models/connection");
const ObjectId = require('mongodb').ObjectId
const bcrypt = require('bcrypt');


module.exports = {

  findUser: (userId) => {
    return new Promise(async (resolve, reject) => {
      await db.user.findById({ _id: userId }).then((user) => {

        resolve(user)
      })

    })
  },

  //profile update
  updateProfile: async (data, userId) => {
    const number = data.phone;


    await new Promise(async (resolve, reject) => {

      await db.user.updateOne({ _id: userId },
        {
          $set: {
            username: data.fname,
            email: data.email,
            phonenumber: Number(number),
          }
        }).then((data) => {

          resolve(data)
        });
    });

  },
  verifyPassword: (userData, userId) => {

    return new Promise(async (resolve, reject) => {

      const users = await db.user.findOne({ _id: userId })

      await bcrypt
        .compare(userData.password, users.Password)
        .then(async (status) => {
          if (status) {
            let hashedPassword = await bcrypt.hash(userData.password2, 10);
            await db.user.updateOne(
              { _id: userId },
              {
                $set: {
                  Password: hashedPassword
                }
              }
            ).then((response) => {
              resolve(response)
            })
          }
          else {
            resolve(false)
          }
        }
        );
    })
  },
}
