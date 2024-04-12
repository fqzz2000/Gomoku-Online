import mongoose, { Document, Schema } from 'mongoose';


export interface IRoom extends Document {
  number: string;
  players: string[]; 
  status: 'waiting' | 'playing' | 'ended' | "ready";
}

const roomSchema: Schema = new Schema({
  number: { type: String, required: true },
  players: [{ type: String, required: true }],
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ended', 'ready'],
    default: 'waiting'
  }
});

// 创建模型
const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;
