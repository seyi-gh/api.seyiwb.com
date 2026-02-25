import { Router } from 'express';
import { strictLimiter } from '../middlewares/rateLimiter';
import UserController from '../controllers/user.controller';

const authRoutes = Router();

authRoutes.post('/signin', strictLimiter, UserController.signin);
authRoutes.post('/login', strictLimiter, UserController.login);
authRoutes.post('/logout', UserController.logout);

export default authRoutes;