import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from '../../ui/src/common';

import express, { Request, Response,NextFunction } from 'express'
import session from 'express-session';
import MongoStore from 'connect-mongo';
const app = express();
// Middleware
app.use(express.json());
const mongoUrl = 'mongodb://127.0.0.1:27017/sessiondb';  

app.use(session({
  secret: 'a just so-so secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },

  // the default store is memory-backed, so all sessions will be forgotten every time the server restarts
  // uncomment the following to use a Mongo-backed store that will work with a load balancer
  store: MongoStore.create({
    mongoUrl: 'mongodb://127.0.0.1:27017',
    ttl: 14 * 24 * 60 * 60 // 14 days
  })
}))
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatar: string;
  game_stats: {
    total_games_played: number;
    total_wins: number;
    total_losses: number;
    win_rate: number;
    average_game_time: number;
    rank: string;
  };
}
export interface IUser extends Document {
  username: string;
  password: string;
  email: string;
  avatar: string;
  game_stats: {
    total_games_played: number;
    total_wins: number;
    total_losses: number;
    win_rate: number;
    average_game_time: number;
    rank: string;
  };
}



declare module "express-session" {
  export interface SessionData {
    user?: IUser;
  }
}

export class AuthService {
  // 增加类型注解来提高代码的可维护性和错误检测
  // public async verifySessionAndToken(req: Request): Promise<string | false> {
  //   // 首先检查 session
  //   if (req.session && req.session.user) {
  //     console.log("Session user found:", req.session.user.username);
  //     return req.session.user.username; // 假设 session 中已正确设置了 user 对象
  //   }
    public async verifySessionAndToken(token: string): Promise<string|false> {
      try {
        // http post request to verify token
        const response = await axios.post('http://localhost:8131/api/authentication', {}, {
          headers:{
            Authorization: `Bearer ${token}`
          }
        })
        console.log("response from authentication:", response.data);
  
        return response.data.username||response.data.preferred_username;
      } catch (error) {
        if (error instanceof Error) {
          console.error("authentication failed in AuthService:");
          console.error(error.message);
        }
        return false;
      }
    }
  }