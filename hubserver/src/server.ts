
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
import jwksClient from 'jwks-rsa';
import { JwtHeader } from 'jsonwebtoken';
//import { SigningKeyCallback } from 'jwks-rsa';
//import { Key } from 'jwks-rsa';
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


// app.use(session({
//   secret: 'a just so-so secret',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: false },

//   // the default store is memory-backed, so all sessions will be forgotten every time the server restarts
//   // uncomment the following to use a Mongo-backed store that will work with a load balancer
//   // store: MongoStore.create({
//   //   mongoUrl: 'mongodb://127.0.0.1:27017',
//   //   ttl: 14 * 24 * 60 * 60 // 14 days
//   // })
// }))
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
        id: userInfo.sub, 
        username: userInfo.preferred_username || userInfo.name,
        email: userInfo.email,
        accessToken: tokenSet.access_token,
        idToken: tokenSet.id_token
    };
    
  
     // return done(null, user); // 现在 enrichedUser 包括了令牌信息
     User.findOne({ email: userInfo.email }, async (err:Error | null, existingUser:IUser) => {
      if (err) {
        return done(err, null);
      }
      if (existingUser) {
          // 用户已存在，直接返回现有用户
          return done(null, user);
      }
      // 创建新用户
      const newUser = new User({
          username: userInfo.preferred_username || userInfo.name || userInfo.email,
          email: userInfo.email,
          // 密码字段不设置
          avatar: "/public/uploads/default-avatar.png",
          game_stats: {
              total_games_played: 0,
              total_wins: 0,
              total_losses: 0,
              win_rate: 0,
              average_game_time: 0,
              rank: 'Newbie',
          }
      });

      try {
          const savedUser = await newUser.save();
          done(null, user);
      } catch (error) {
          console.error("Error creating new user:", error);
          done(error, null);
      }
    });
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

  if (req.user && req.user.idToken) {
    // 注意安全风险，仅在安全的环境下这样做
    req.session.user = req.user; 
    res.redirect(`http://localhost:5173/?token=${req.user.idToken}`);
  } else {
    res.redirect('/login?error=token_missing');
  }
});

//const jwksClient = require('jwks-rsa');

// 创建 JWKS 客户端
const client = jwksClient({
  jwksUri: 'https://coursework.cs.duke.edu/.well-known/jwks.json'
});
interface MyHeader extends JwtHeader {
  kid?: string;
}

function getKey(header: MyHeader, callback: (err: Error | null, key?: string) => void){
  if (header.alg === 'RS256') {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err, undefined);
        return;
      }
      if (!key) {
        callback(new Error('Signing key not found'), undefined);
        return;
      }
      // 正确获取 RSA 公钥
      const signingKey = key.getPublicKey();
      console.log("this is the public key:",signingKey);
      callback(null, signingKey);
    });
  } else {
    // 对于非 RS256 算法，使用本地密钥
    callback(null, secretKey);
  }
}




const authenticateJWT = (req: Request, res: Response, next:NextFunction) => {
  
//   if (req.session && req.session.user) {
//     req.user = req.session.user;
//     console.log("username in middleware is:", req.user.username);
//     return next();
// }
  

  
  
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
// if (authHeader) {

//       const token = authHeader.split(' ')[1];
//       console.log("start verify token:", token);
  
//       // 尝试使用 OIDC JWKS 或本地密钥验证 token
//       jwt.verify(token, getKey, 
//         // {
//         // audience: '5d44e78f444d228c5ca337ce6d0cb96f4d9231a5403734becf20fdff2fd44e6b', // 你的预期受众
//         // issuer: 'https://coursework.cs.duke.edu', // 你的 OIDC 发行者
//         // algorithms: ['RS256', 'HS256'] }, 
//         (err, decoded) => {
//         if (err) {
//           console.error("Token verification failed:", err);
//           return res.sendStatus(403);
//         }
  
//         // 你可以根据情况调整下面的属性名称，以适应你的用户模型
//         req.user = decoded as IUser;
//         console.log("Token is valid. User:", req.user.name);
//         next();
//       });
//     } else {
//       console.log("No token provided");
//       res.sendStatus(401);
//     }
//   };
//   if (authHeader) {
//     const token = authHeader.split(' ')[1];

//     // 尝试使用 OIDC JWKS 或本地密钥验证 token
//     jwt.verify(token, getKey, {
//       audience: '5d44e78f444d228c5ca337ce6d0cb96f4d9231a5403734becf20fdff2fd44e6b', // 你的预期受众
//       issuer: 'https://coursework.cs.duke.edu', // 你的 OIDC 发行者
//       algorithms: ['RS256', 'HS256']  // 支持的算法
//     }, (err, decoded) => {
//       if (err) {
//         console.error("Token verification failed:", err);
//         return res.sendStatus(403);
//       }

//       // 你可以根据情况调整下面的属性名称，以适应你的用户模型
//       req.user = decoded as IUser;
//       console.log("Token is valid. User:", req.user.name);
//       next();
//     });
//   } else {
//     console.log("No token provided");
//     res.sendStatus(401);
//   }
// };



app.get("/",authenticateJWT,(req, res) => {


  res.send("Hello World")
})
//app.get('/api/users',authenticateJWT,(req, res) => (userController.getUserProfile(req, res)));
app.get('/api/users/${username}', authenticateJWT, (req, res) => {
  console.log("reached api/user end");
  if (req.user) {
    console.log("username in api:", req.user.username);
      // 假设 userController.getUserProfile 方法已经正确实现并返回用户数据
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

//app.post('/api/login', loginUser);
app.post('/api/rooms',authenticateJWT, createRoom);
app.get('/api/rooms',authenticateJWT, getRooms);
app.delete('/api/rooms/:id', authenticateJWT,deleteRoomById);
app.get('/api/rooms/:roomId',authenticateJWT, getRoomById);
app.post('/api/authentication',authenticateJWT, (req, res) => {
  console.log("reached authentication ");
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

