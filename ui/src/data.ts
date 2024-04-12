import axios from 'axios';
import { User } from './common';

export class Data {
    public static async fetchUserProfile(username: string): Promise<User> {
            let ret : User = {id : "",
                username : "",
                avatar : "",
                totalGame : 0 ,
                winRate : 0};
            try {
              const response = await axios.get(`/api/users/${username}`);
                ret.username = response.data.username;
              ret.totalGame = response.data.game_stats.total_games_played;
              if (response.data.total_games_played > 0) {
                ret.winRate = (response.data.game_stats.total_wins / response.data.game_stats.total_games_played) * 100;
            } 
            console.log("User info fetched:", ret);
            } catch (error) {
              if (error instanceof Error) {
                console.error(error.message);
              } else {
                console.error("Failed to fetch user info:", error);
              }
            } finally {
              return ret;
            }
          }
}