import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController,registerUser, loginUser } from './controllers/UserController';
import jwt from 'jsonwebtoken';
import Room from './models/RoomModel';
import {createRoom,deleteRoomById,getRoomById,getRooms, RoomController } from './controllers/RoomController';

// set up Mongo
const url = 'mongodb://127.0.0.1:27017'

// set up Express
const app = express()
const port = parseInt(process.env.PORT as string) || 8131
const userController = new UserController()
const roomController = new RoomController()
app.use(bodyParser.json())


const logger = pino({
  transport: {
      target: 'pino-pretty'
  }
})
app.get("/", (req, res) => {
    res.send("Hello World")
})
app.get('/api/users/:username', (req, res) => (userController.getUserProfile(req, res)));




app.post('/api/register', registerUser);
app.post('/api/login', loginUser);


app.post('/api/rooms', createRoom);
  app.get('/api/rooms', getRooms);
  app.delete('/api/rooms/:id', deleteRoomById);
app.get('/api/rooms/:roomId', getRoomById);

app.post("/api/UpdateGameResult", async (req: Request, res: Response) => {
  // to be implemented
  userController.updateGameResult(req, res);
})

app.post("/api/UpdateRoomState", async (req: Request, res: Response) => {
  roomController.updateRoomInfo(req, res);
})
mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`)
    })})


