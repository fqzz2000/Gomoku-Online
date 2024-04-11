import express, { Request, Response,NextFunction } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController,registerUser, loginUser } from './controllers/UserController';
import jwt from 'jsonwebtoken';
import Room from './models/RoomModel';
import {createRoom,deleteRoomById,getRoomById,getRooms } from './controllers/roomController';
// set up Mongo

import bcrypt from 'bcrypt';
import User from './models/UserModel';
const url = 'mongodb://127.0.0.1:27017'

// set up Express
const app = express()
const port = parseInt(process.env.PORT as string) || 8131
const userController = new UserController()
//onst token = localStorage.getItem('token');
app.use(bodyParser.json())


const logger = pino({
  transport: {
      target: 'pino-pretty'
  }
})
const authenticateJWT = (req: Request, res: Response, next:NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      //req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.get("/", authenticateJWT,(req, res) => {
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
mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`)
    })})

