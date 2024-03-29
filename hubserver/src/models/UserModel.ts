import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  game_stats: {
    total_games_played: number;
    total_wins: number;
    total_losses: number;
    win_rate: number;
    average_game_time: number;
    rank: string;
  };
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  game_stats: {
    total_games_played: { type: Number, required: true },
    total_wins: { type: Number, required: true },
    total_losses: { type: Number, required: true },
    win_rate: { type: Number, required: true },
    average_game_time: { type: Number, required: true },
    rank: { type: String, required: true },
  },
});

export default mongoose.model<IUser>('User', UserSchema);


