import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from '../../ui/src/common';
export class AuthService {
  public async verifyToken(token: string): Promise<string|false> {
    try {
      // http post request to verify token
      const response = await axios.post('http://localhost:8131/api/authentication', {}, {
        headers:{
          Authorization: `Bearer ${token}`
        }
      })
      console.log("response from authentication:", response.data);

      return response.data.username;
    } catch (error) {
      if (error instanceof Error) {
        console.error("authentication failed in AuthService:");
        console.error(error.message);
      }
      return false;
    }
  }
}
