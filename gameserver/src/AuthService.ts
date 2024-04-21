import jwt from 'jsonwebtoken';
import axios from 'axios';


export class AuthService {
  // 增加类型注解来提高代码的可维护性和错误检测
  // public async verifySessionAndToken(req: Request): Promise<string | false> {
  //   // 首先检查 session
  //   if (req.session && req.session.user) {
  //     console.log("Session user found:", req.session.user.username);
  //     return req.session.user.username; // 假设 session 中已正确设置了 user 对象
  //   }
    public async verifySessionAndToken(token: string): Promise<string|false> {
      try {
        // http post request to verify token
        const response = await axios.post('http://localhost:8131/api/authentication', {}, {
          headers:{
            Authorization: `Bearer ${token}`
          }
        })
        console.log("response from authentication:", response.data);
  
        return response.data.username||response.data.preferred_username;
      } catch (error) {
        if (error instanceof Error) {
          console.error("authentication failed in AuthService:");
          console.error(error.message);
        }
        return false;
      }
    }
  }