import mongoose, { Document, Schema } from 'mongoose';

interface IRoom extends Document {
  number: string;
  player: string;
  status: 'waiting' | 'playing' | 'ready';
}

const roomSchema: Schema = new Schema({
  number: { type: String, required: true },
  player: { type: String, required: true },
  status: {
    type: String,
    enum: ['waiting', 'playing', 'ready'],
    default: 'waiting'
  }
});

// 创建模型
const Room = mongoose.model<IRoom>('Room', roomSchema);

export default Room;
