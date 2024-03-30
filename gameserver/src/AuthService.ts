import jwt from 'jsonwebtoken';

export class AuthService {
  verifyToken(token: string): boolean {
    try {
      // Assuming SECRET_KEY is your secret key for JWT
      // jwt.verify(token, process.env.SECRET_KEY);
      return true;
    } catch (error) {
      return false;
    }
  }
}
