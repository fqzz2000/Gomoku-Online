
import express, { Request, Response,NextFunction } from 'express'

import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController,registerUser, loginUser } from './controllers/UserController';
import jwt, { JwtPayload } from 'jsonwebtoken';
import Room from './models/RoomModel';

import {createRoom,deleteRoomById,getRoomById,getRooms, RoomController,addPlayerToRoom ,removePlayerFromRoom} from './controllers/RoomController';

// set up Mongo

import bcrypt from 'bcrypt';

import User, { IUser } from './models/UserModel';
import { Issuer, Strategy, generators } from 'openid-client';
import passport from 'passport';
import session from 'express-session';
import { gitlab } from "./secrets"
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
declare module 'express-session' {
  export interface SessionData {
    credits?: number
  }
}

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

  function verify(tokenSet: any, userInfo: any, done: (error: any, user: any) => void) {

      console.log('tokenSet:', tokenSet);
      console.log('userInfo:', userInfo);
  
      // 假设你想把 access_token 和 id_token 存储起来
      const user = {
        id: userInfo.sub, // OIDC "sub" (subject) 通常是用户的唯一标识符
        username: userInfo.preferred_username || userInfo.name,
        email: userInfo.email,
        accessToken: tokenSet.access_token,
        idToken: tokenSet.id_token
    };
  
      return done(null, user); // 现在 enrichedUser 包括了令牌信息
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
  failureRedirect: '/login',
}), (req, res) => {
  // 检查 user 对象是否包括令牌信息

  if (req.user && req.user.accessToken) {
    // 注意安全风险，仅在安全的环境下这样做
    req.session.user = req.user; 
    res.redirect(`http://localhost:5173/?token=${req.user.accessToken}`);
  } else {
    res.redirect('/login?error=token_missing');
  }
});


const authenticateJWT = (req: Request, res: Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;
  // print out the entire request object
  console.log("Request object: ", req.headers);
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {

        console.error("Error verifying JWT:", err);
        return res.sendStatus(403);

      }

      if (typeof decoded === 'object' && decoded !== null && 'username' in decoded) {
        // Assuming that decoded object is of type IUser or has at least a 'username' property.
        req.user = decoded as IUser;
        next();
      } else {
        return res.sendStatus(401); // Unauthorized
      }
    });
  } else {

    console.log("No token")
    res.sendStatus(401);

  }
};

app.get("/",(req, res) => {


  res.send("Hello World")
})
app.get('/api/users/:username',authenticateJWT,(req, res) => (userController.getUserProfile(req, res)));



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

//app.post('/api/login', loginUser);
app.post('/api/rooms',authenticateJWT, createRoom);
app.get('/api/rooms',authenticateJWT, getRooms);
app.delete('/api/rooms/:id', authenticateJWT,deleteRoomById);
app.get('/api/rooms/:roomId',authenticateJWT, getRoomById);
app.post('/api/authentication',authenticateJWT, (req, res) => {
  return res.status(200).json(req.user);
});



app.post("/api/UpdateGameResult", async (req: Request, res: Response) => {
  // to be implemented
  userController.updateGameResult(req, res);
})

app.post("/api/UpdateRoomState", async (req: Request, res: Response) => {
  roomController.updateRoomInfo(req, res);
})

app.post('/api/rooms/:roomId/players/add', addPlayerToRoom);


app.post('/api/rooms/players/remove', removePlayerFromRoom);


// static files
app.use('/public', express.static('public'));

mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, ()=> {
        logger.info(`Server running on port ${port}`)
    })})

