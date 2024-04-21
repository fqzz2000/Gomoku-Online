import axios from 'axios';
import { User } from './common';
import { getWithToken } from './utils';

export class Data {
    public static async fetchUserProfile(username: string, token:string): Promise<User> {
            let ret : User = {id : "",
                username : "",
                avatar : "",
                totalGame : 0 ,
                winRate : 0,
                email : ""};
            try {
              const response = await getWithToken(`/api/users/new/${username}`,token);
              ret.avatar = response.data.avatar;
                ret.username = response.data.username;
              ret.totalGame = response.data.game_stats.total_games_played;
              if (response.data.game_stats.total_games_played > 0) {
                ret.winRate = (response.data.game_stats.total_wins / response.data.game_stats.total_games_played) * 100;
            } 
              ret.email = response.data.email;
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

          public static async fetchUserProfileNew(username: string, token:string): Promise<User> {
            let ret : User = {id : "",
                username : "",
                avatar : "",
                totalGame : 0 ,
                winRate : 0,
                email : ""};
            try {
              const response = await getWithToken(`/api/users/${username}`,token);
              ret.avatar = response.data.avatar;
                ret.username = response.data.username;
              ret.totalGame = response.data.game_stats.total_games_played;
              if (response.data.game_stats.total_games_played > 0) {
                ret.winRate = (response.data.game_stats.total_wins / response.data.game_stats.total_games_played) * 100;
            } 
              ret.email = response.data.email;
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