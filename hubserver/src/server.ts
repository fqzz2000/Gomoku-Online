import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController } from './controllers/UserController';

// set up Mongo
const url = 'mongodb://127.0.0.1:27017'

// set up Express
const app = express()
const port = parseInt(process.env.PORT as string) || 8131
const userController = new UserController()
app.use(bodyParser.json())

// set up Pino logging
const logger = pino({
    transport: {
        target: 'pino-pretty'
    }
})

app.get("/", (req, res) => {
    res.send("Hello World")
})
app.get('/api/users/:username', (req, res) => (userController.getUserProfile(req, res)));


mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`)
    })})


