const mongoose = require('mongoose');

const dbSchema = new mongoose.Schema({
  firstname:String,
  lastname:String,
  email:String,
  age:String
})

module.exports = mongoose.model("redisData",dbSchema)