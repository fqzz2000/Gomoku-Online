import { Request, Response } from 'express';
import { UserService } from '../services/UserService';

// userController.ts

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/UserModel';


const secretKey = process.env.SECRET_KEY || '9b1d8eead0f1b2c3d4e5f6901a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t';

export const registerUser = async (req: Request, res: Response) => {
  const { username, password, email } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const defaultGameStats = {
    total_games_played: 0,
    total_wins: 0,
    total_losses: 0,
    win_rate: 0,
    average_game_time: 0,
    rank: 'Newbie',
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
    console.error("Error registering new user:", error);
    res.status(500).json({ error: 'Error registering new user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username }).exec();
    if (user && await bcrypt.compare(password, user.password)) {
      // 用户认证成功，生成并返回JWT
      const token = jwt.sign({ username: username }, secretKey, { expiresIn: '1h' });
      // 在响应中返回token和用户名
      res.json({ token, username });
    } else {
      // 用户认证失败
      res.status(401).json({ error: 'Authentication failed' });
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async updateGameResult(req: Request, res: Response): Promise<void> {
    const { gameResult  } = req.body;
    const player1 = gameResult.player1;
    const player2 = gameResult.player2;
    const winner = gameResult.winner;
    if (!player1 || !player2 || !winner) {
      res.status(400).json({ message: "Missing 'player1', 'player2', or 'winner'." });
      return;
    }
    try {
      await this.userService.incrementUserGameStats(player1, winner === 1, winner === 0);
      await this.userService.incrementUserGameStats(player2, winner === 2, winner === 0);
      res.status(200).json({ message: 'Game result updated successfully' });
    } catch (error) {
      console.error('Error updating game result:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
      }
    }
  }

  public async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      console.log('Request received');
      const username = req.params.username;
      console.log('start to get user: ', username);
      const user = await this.userService.getUserByUsername(username);
      console.log('User found:', user);

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        console.log('User not found');
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error getting user:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
  }
}
