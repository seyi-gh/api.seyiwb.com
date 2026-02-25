import jwt from 'jsonwebtoken';
import config from '../config';
import { Users } from '../models/User';
import { Request, Response } from 'express';
import { verifyPassword } from '../services/auth.service';

//TODO Improve and check the speed of the method
//? Generic handler for mongo error in creation of an user
const isMongoDuplicateKeyError = (error: unknown): error is { code: number } => {
  if (typeof error !== 'object' || error === null) return false;
  if (!('code' in error)) return false;

  return (error as { code?: unknown }).code === 11000;
};

class UserController {
  static async signin(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        res.status(400).json({ message: 'Some variable in the body is missing' });
        return;
      }

      const createdUser = await Users.create({
        username,
        email,
        passwordHash: password
      });

      res.status(201).json({ redirect: '/login', username: createdUser.username });
    } catch (error: unknown) {
      if (isMongoDuplicateKeyError(error)) {
        res.status(409).json({ message: 'Username or email already exists' });
        return;
      }

      console.error('Error registering user -> ', error); //!!
      res.status(400).json({ message: 'Internal error' });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' });
        return;
      }

      const user = await Users.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const isValidPassword = await verifyPassword(user.passwordHash, password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          username: user.username
        },
        config.jwt_secret,
        { expiresIn: config.jwt_time }
      );

      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: config.cookie_secure,
        domain: config.cookie_domain,
        sameSite: 'lax',
        maxAge: config.cookie_time
      });

      res.status(200).json({ message: 'Status of login is successfull' });
    } catch (error: unknown) {
      console.error('Error logging in -> ', error); //!!
      res.status(500).json({ message: 'Error logging in. Try again.' });
    }
  }

  static logout(_req: Request, res: Response): void {
    res.clearCookie('auth_token', { domain: config.cookie_domain });
    res.status(200).json({ message: 'Logout successful' });
  }
}

export default UserController;