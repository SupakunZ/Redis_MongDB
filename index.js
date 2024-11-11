const express = require('express');
const app = express();
const port = 8000;
const ConnectDB = require('./lib/connectDB')
const modelDB = require('./model/modelDB')
const redis = require("redis");

require("dotenv").config();

//** อนุญาติให้ส่งมาเป็น JSON */
app.use(express.json())

// **Connect Redis database **
const client = redis.createClient({
  // data จาก Redis could
  password: 'WzLgPDOPmk6kgAUG1njXKlXb2iPF8SsQ',
  socket: {
      host: 'redis-18196.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
      port: 18196
  }
});

// ** Log Conneneted Redis **
client.on("connect", () => console.log("Redis connected"))
client.on("error", (err) => console.error("Redis Client Error", err));

app.get("/", async (req,res) => {
  try {
    // ดึงข้อมูลจาก sting จาก users
    const userCache = await client.get("users")
  
    // ตรวจสอบเงื่อนไขว่ามีข่อมูลไหม
    if (userCache) {
    // ถ้ามี response ข้อมูลที่ cache จาก redis storage ไป 
      res.json({user:JSON.parse(userCache)})
    } else {
    // 1.ถ้าไม่มี ดึงค่าจาก database MongoDB   
      const response = await modelDB.find({});
    // 2.cache data ที่ดึงมาลงใน redis 
      await client.setEx("users", 3600 ,JSON.stringify(response)) // #3600 เวลาหมดอายุ data ที่ cache ไว้
      res.json({user: response})
    }
  } catch (error) {
    console.log("Error", error)
    res.status(500).json({error:error.message})
  }
})


//create new user
app.post("/product", async (req, res) => {
  try {
  const data = await req.body
  const response = await modelDB(data).save()

  //** เมื่อมีการเพิ่ม data ใน mongoDB ลบ data ที่ cache ได้ใน redis */
  await client.del("users")
  res.json({message:"Succesfuly!!",data:response})
  } catch (error) {
    console.log("Error", error)
    res.status(500).json({error:error.message})
  }
  
})

app.listen(port, async () => {
  // ** Connect MongoDB **
  ConnectDB();
  
  // ** Connect Redis Database **
  await client.connect();
  console.log(`Server is running on port ${port}`)
})