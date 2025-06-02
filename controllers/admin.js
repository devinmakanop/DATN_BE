const admin = require("../models/admin")

module.exports.checkToken = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  console.log(token)

  const user = await admin.findOne({
    token: token
  })

  if (user) {
    res.json({
      code: 200,
      message: "Tồn tại token!",
    })
  } else {
    res.json({
      code: 400,
      message: "Token sai!",
    })
  }
}