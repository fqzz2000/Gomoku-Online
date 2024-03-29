import User, { IUser } from '../models/UserModel';

export class UserService {
  async getUserByUsername(username: string): Promise<IUser | null> {
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
}
