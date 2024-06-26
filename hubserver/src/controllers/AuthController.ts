import User, { IUser } from '../models/UserModel';
import express, { Request, Response,NextFunction } from 'express'
import jwksClient from 'jwks-rsa';
import { JwtHeader } from 'jsonwebtoken';
import jwt, { JwtPayload } from 'jsonwebtoken';
import session from 'express-session';
const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';
export function verify(tokenSet: any, userInfo: any, done: (error: any, user: any) => void) {

    console.log('tokenSet:', tokenSet);
    console.log('userInfo:', userInfo);
    console.log('Groups:', userInfo.groups);

    // 假设你想把 access_token 和 id_token 存储起来
    const user = {
      id: userInfo.sub, 
      username: userInfo.preferred_username || userInfo.name,
      email: userInfo.email,
      accessToken: tokenSet.access_token,
      idToken: tokenSet.id_token,
      groups:userInfo.groups
  };
  

   // return done(null, user); // 现在 enrichedUser 包括了令牌信息
   User.findOne({ username: userInfo.preferred_username || userInfo.name}, async (err:Error | null, existingUser:IUser) => {
    if (err) {
      return done(err, null);
    }
    if (existingUser) {
        // 用户已存在，直接返回现有用户
        return done(null, user);
    }
    // 创建新用户
    const newUser = new User({
        username: userInfo.preferred_username || userInfo.name,
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
const client = jwksClient({
    jwksUri: 'https://coursework.cs.duke.edu/oauth/discovery/keys'
  });
  interface MyHeader extends JwtHeader {
    kid?: string;
  }
  
export function getKey(header: MyHeader, callback: (err: Error | null, key?: string) => void){
    if (header.alg === 'RS256') {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          console.log("did not find the key!");
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
      console.log("this is the secret key:",secretKey);
    }
  }

  declare module 'express-serve-static-core' {
    interface Request {
      user: any; 
    }
  }

  export function checkGroupAccess(requiredGroup: string) {
    return function(req: Request, res: Response, next: NextFunction) {
      console.log("user in group middleware is:",req.user);
      console.log("group is:",req.user.groups);
        if (req.user && req.user.groups && req.user.groups.includes(requiredGroup)) {
            
          next();  
        } else {
            res.status(403).send('Access Denied'); 
  
        }
    };
  }



  export const authenticateJWT = (req: Request, res: Response, next:NextFunction) => {
  
    if (req.session && req.session.user) {
      req.user = req.session.user;
      console.log("username in middleware is:", req.user.username);
      return next();
  }
    
  const authHeader = req.headers.authorization;
  //   // print out the entire request object
  //   console.log("Request object: ", req.headers);
  //   if (authHeader) {
  //     const token = authHeader.split(' ')[1];
  
  //     jwt.verify(token, secretKey, (err, decoded) => {
  //       if (err) {
  
  //         console.error("Error verifying JWT:", err);
  //         return res.sendStatus(403);
  
  //       }
  
  //       if (typeof decoded === 'object' && decoded !== null && 'username' in decoded) {
  //         // Assuming that decoded object is of type IUser or has at least a 'username' property.
  //         req.user = decoded as IUser;
  //         next();
  //       } else {
  //         return res.sendStatus(401); // Unauthorized
  //       }
  //     });
  //   } else {
  
  //     console.log("No token")
  //     res.sendStatus(401);
  
  //   }
  // };
  if (authHeader) {
  
        const token = authHeader.split(' ')[1];
        console.log("start verify token:", token);
    
       
        jwt.verify(token, getKey, 
          // {
          // audience: '5d44e78f444d228c5ca337ce6d0cb96f4d9231a5403734becf20fdff2fd44e6b', // 你的预期受众
          // issuer: 'https://coursework.cs.duke.edu', // 你的 OIDC 发行者
          // algorithms: ['RS256', 'HS256'] }, 
          (err, decoded) => {
          if (err) {
            console.error("Token verification failed:", err);
            return res.sendStatus(403);
          }
    
        
          req.user = decoded;
          console.log("Token is valid. Userinfo:", req.user);
          console.log("Token is valid. User:", req.user.preferred_username);
          next();
        });
      } else {
        console.log("No token provided");
        res.sendStatus(401);
      }
    };
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
  
       
  //       req.user = decoded as IUser;
  //       console.log("Token is valid. User:", req.user.name);
  //       next();
  //     });
  //   } else {
  //     console.log("No token provided");
  //     res.sendStatus(401);
  //   }
  // };