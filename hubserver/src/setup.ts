// setup.ts

import mongoose from 'mongoose';
import User from './models/UserModel'; // 假设你的UserModel导出路径是这个

const mongoURI = 'mongodb://127.0.0.1:27017';

const testData = [
  {
    username: 'user1',
    email: 'user1@example.com',
    game_stats: {
      total_games_played: 100,
      total_wins: 60,
      total_losses: 40,
      win_rate: 60,
      average_game_time: 1200,
      rank: 'Gold',
    },
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    game_stats: {
      total_games_played: 80,
      total_wins: 40,
      total_losses: 40,
      win_rate: 50,
      average_game_time: 1000,
      rank: 'Silver',
    },
  },
  // 添加更多测试用户...
];

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

async function insertTestData() {
  try {
    await User.deleteMany({}); // 清除现有的测试数据
    await User.insertMany(testData);
    console.log('Test data inserted successfully.');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.disconnect();
  }
}

insertTestData();