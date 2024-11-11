const mongoose = require("mongoose")

const ConnectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL)
     console.log("ConnectDB");
  } catch (error) {
    console.log("Connect Failed" + error);
  }
}

module.exports = ConnectDB