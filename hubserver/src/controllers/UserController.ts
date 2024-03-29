import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import pino from 'pino';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
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
