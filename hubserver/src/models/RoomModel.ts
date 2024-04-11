import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
  number: string;
  player: string;
  status: 'waiting' | 'playing' | 'ended' | "ready";

}

const roomSchema: Schema = new Schema({
  number: { type: String, required: true },
  player: { type: String, required: true },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ended', 'ready'],

    default: 'waiting'
  }
});

// 创建模型
const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;
