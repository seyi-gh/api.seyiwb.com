import { Router } from 'express';
import { strictLimiter } from '../middlewares/rateLimiter';
import UserController from '../controllers/user.controller';

const authRoutes = Router();

authRoutes.post('/signin', strictLimiter, UserController.signin);
authRoutes.post('/login', strictLimiter, UserController.login);
authRoutes.post('/logout', UserController.logout);
authRoutes.get('/email-confirm', strictLimiter, UserController.verifyEmail);
authRoutes.post('/resend-verification', strictLimiter, UserController.resendVerificationEmail);
//!! authRoutes.post('/test/remove-user', globalLimiter, UserController.removeUserByEmail); //!!

export default authRoutes;