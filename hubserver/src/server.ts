import express from 'express'
import bodyParser from 'body-parser'
import pino from 'pino'
import expressPinoLogger from 'express-pino-logger'
import mongoose from 'mongoose'
import { UserController } from './controllers/UserController';
import jwt from 'jsonwebtoken';

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
import bcrypt from 'bcrypt';
import User from './models/UserModel'; // 确保路径正确

const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';


async function authenticateUser(username: string, password: string): Promise<boolean> {
  const user = await User.findOne({ username }).exec();
  if (user) {
    return bcrypt.compare(password, user.password); // bcrypt.compare返回一个Promise，该Promise解析为比较结果（true或false）
  }
  return false;
}
app.post('/api/register', async (req, res) => {
  const { username, password, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const defaultGameStats = {
    total_games_played: 0,
    total_wins: 0,
    total_losses: 0,
    win_rate: 0,
    average_game_time: 0,
    rank: 'Newbie', // 或者任何你认为合适的默认等级
  };

  const user = new User({
    username,
    password: hashedPassword,
    email,
    game_stats: defaultGameStats,
  });

  try {
    const savedUser = await user.save();
    res.status(201).json({ userId: savedUser._id });
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user' });
  }
});

  
app.use(express.json());
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).exec();
  if (user && await bcrypt.compare(password, user.password)) {
    // 用户认证成功，生成并返回JWT
    const token = jwt.sign({ username: username },secretKey, { expiresIn: '1h' });
    res.json({ token });
  } else {
    // 用户认证失败
    res.status(401).json({ error: 'Authentication failed' });
  }
});
mongoose.connect(url).then(() => {
    logger.info('Connected to MongoDB')
    app.listen(port, () => {
        logger.info(`Server running on port ${port}`)
    })})


