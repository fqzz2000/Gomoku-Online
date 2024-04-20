
import express, { Request, Response,NextFunction } from 'express'

import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController,registerUser, loginUser } from './controllers/UserController';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Room from './models/RoomModel';
import { verify ,authenticateJWT,checkGroupAccess } from './controllers/AuthController';

import multer from 'multer';

import {createRoom,deleteRoomById,getRoomById,getRooms, RoomController,addPlayerToRoom ,removePlayerFromRoom} from './controllers/RoomController';

// set up Mongo

import bcrypt from 'bcrypt';

import User, { IUser } from './models/UserModel';
import { Issuer, Strategy, generators } from 'openid-client';
import passport from 'passport';
import session from 'express-session';
import { gitlab } from "./secrets"
import jwksClient from 'jwks-rsa';
import { JwtHeader } from 'jsonwebtoken';
//import { SigningKeyCallback } from 'jwks-rsa';
//import { Key } from 'jwks-rsa';
import MongoStore from 'connect-mongo';

const url = 'mongodb://127.0.0.1:27017'

// set up Express
const app = express()
const port = parseInt(process.env.PORT as string) || 8131
const userController = new UserController()

//onst token = localStorage.getItem('token');

const roomController = new RoomController()

app.use(bodyParser.json())
declare module 'express-serve-static-core' {
  interface Request {
    user: any; 
  }
}

declare module "express-session" {
  export interface SessionData {
    user?: IUser;
  }
}

const logger = pino({
  transport: {
      target: 'pino-pretty'
  }
})


app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  // the default store is memory-backed, so all sessions will be forgotten every time the server restarts
  // uncomment the following to use a Mongo-backed store that will work with a load balancer
  // store: MongoStore.create({
  //   mongoUrl: 'mongodb://127.0.0.1:27017',
  //   ttl: 14 * 24 * 60 * 60 // 14 days
  // })
}))


app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => {
  console.log("serializeUser", user)
  done(null, user)
})
passport.deserializeUser((user: any, done) => {
  console.log("deserializeUser", user)
  done(null, user)
})


Issuer.discover("https://coursework.cs.duke.edu/").then(issuer => {
  const client = new issuer.Client(gitlab)

  const params = {
    scope: 'openid profile email',
    nonce: generators.nonce(),
    redirect_uri: 'http://localhost:8131/login-callback',
    state: generators.state(),
  }
  
  passport.use('oidc', new Strategy({ client, params }, verify))

  // app.listen(port, () => {
  //   console.log(`Server listening on port ${port}`)
  // })
})

app.get('/login/oidc', passport.authenticate('oidc', {
  successReturnToOrRedirect: "/"
}))


app.get('/login-callback', passport.authenticate('oidc', {
  failureRedirect: 'http://localhost:5173/login',
}), (req, res) => {


  if (req.user && req.user.idToken) {

    req.session.user = req.user; 
    res.redirect(`http://localhost:5173/?token=${req.user.idToken}`);
  } else {
    res.redirect('http://localhost:5173/login?error=token_missing');
  }
});

//const jwksClient = require('jwks-rsa');




app.get("/",authenticateJWT,(req, res) => {


  res.send("Hello World")
})
//app.get('/api/users',authenticateJWT,(req, res) => (userController.getUserProfile(req, res)));
app.get('/api/users/:username', authenticateJWT, (req, res) => {
  console.log("reached api/user end");
  if (req.user) {
    console.log("username in api:", req.user.username);
     
      userController.getUserProfile(req, res);
  } else {
      res.status(401).send("Unauthorized");
  }
});



app.post('/api/register', registerUser);

const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
app.post('/api/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).json({ error: 'Authentication failed: user not found.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Authentication failed: wrong password.' });
    }

    // 用户认证成功，生成并返回 JWT
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    res.json({ token, username });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
});




app.post('/api/rooms',authenticateJWT,checkGroupAccess('users-able-to-create-room'), createRoom);
app.get('/api/rooms',authenticateJWT, getRooms);
app.delete('/api/rooms/:id', authenticateJWT,checkGroupAccess('users-able-to-create-room'),deleteRoomById);
app.get('/api/rooms/:roomId',authenticateJWT, getRoomById);
app.post('/api/authentication',authenticateJWT, (req, res) => {
  console.log("reached authentication ");
  return res.status(200).json(req.user);
});

app.post('/api/users/updateProfile', authenticateJWT, async (req: Request, res: Response) => {
  userController.updateUserProfile(req, res);
})



app.post("/api/UpdateGameResult", async (req: Request, res: Response) => {
  // to be implemented
  userController.updateGameResult(req, res);
})

app.post("/api/UpdateRoomState", async (req: Request, res: Response) => {
  roomController.updateRoomInfo(req, res);
})

app.post('/api/rooms/:roomId/players/add', addPlayerToRoom);


app.post('/api/rooms/players/remove', removePlayerFromRoom);
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.error('Session destruction error:', err);
    }
    res.clearCookie('connect.sid'); // 'connect.sid' 是默认的会话 cookie 名称，根据配置可能不同
    res.redirect('http://localhost:5173/login'); 
  });
});




// static files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
});
const upload = multer({ storage: storage });
// 定义上传接口
app.post('/api/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send({message : 'File uploaded successfully', filename: req.file.filename});
});
app.use('/public', express.static('public'));

mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, ()=> {
        logger.info(`Server running on port ${port}`)
    })})
