import User, { IUser } from '../models/UserModel';

export class UserService {

  public async getUserByUsername(username: string): Promise<IUser | null> {
    console.log("get username: ", username)
    try {
      console.log("get username: ", username)
      const user = await User.findOne({ username }).exec();
      return user;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }
  public async incrementUserGameStats(username: string, isWin : Boolean, isDraw : Boolean): Promise<void> {

    try {
      const user = await this.getUserByUsername(username);
      if (!user) {
        throw new Error('User not found');
      }
      user.game_stats.total_games_played += 1;
      if (isWin) {
        user.game_stats.total_wins += 1;
      } else if (!isDraw){
        user.game_stats.total_losses += 1;
      } 
      user.game_stats.win_rate = user.game_stats.total_wins / user.game_stats.total_games_played;
      await user.save();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error('An unknown error occurred');
      }
    }
  }
}
