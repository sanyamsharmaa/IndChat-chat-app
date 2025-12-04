import 'dotenv/config';
import express, { urlencoded } from 'express';
import cors from 'cors';
// import routes from './routes.js';
import ConnectMongoDB from "./mongodb.js"
import { Server } from 'socket.io';
// import dotenv from 'dotenv';
// dotenv.config();
import socketHandler from './socket.js';
import http from 'http'
import user_module from './models/userModal.js'
import routes from './routes/routes.js';

const app = express();

app.use(cors({ origin: 'http://localhost:5173',  credentials: true, }));
app.use(express.json());
app.use(urlencoded({extended: true }));
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
});


ConnectMongoDB();

app.post('/login', async (req, res) => {
  try {
    const mail = req.body.mail;
    let user = await user_module.find({ mail: mail });

    if (user.length) {
      user = user[0];
      console.log("user-", user)
      const cookieValue = JSON.stringify({ id: user._id, name: user.name });
      // console.log("cookievalue-", cookieValue)
      res.cookie('user', cookieValue, {
        httpOnly: false,               // not accessible via client JS
        secure: 'production', // requires HTTPS in prod
        sameSite: 'lax',              // or 'none' if cross-site (with secure:true)
        maxAge: 1000 * 60 * 60 * 24    // 1 day (optional)
      });
      return res.status(200).json({success: true,  msg: "login successfully" });
    }
     res.status(500).json({ msg: "no user found for given mail" });
  }
  catch (err) {
    console.log("login error-", err)
    res.status(500).json({ msg: "login failed" });
  }
})

socketHandler(io);
// app.get("/", () => console.log("/path"))
app.use('/',routes)

// app.listen(8000,()=>{
//     console.log("server is running on 8000 port")
// })

server.listen(8000, () => {
  console.log("server is running on 8000 port")
})

