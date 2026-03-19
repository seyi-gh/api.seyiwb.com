import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config';
import { Users } from '../models/User';
import { Request, Response } from 'express';
import { verifyPassword } from '../services/auth.service';
import { sendTransactionalEmail } from '../services/emailService';
import { buildEmailVerificationTemplate } from '../services/emailTemplate';


//TODO Improve and check the speed of the method
//? Generic handler for mongo error in creation of an user
const isMongoDuplicateKeyError = (error: unknown): error is { code: number } => {
  if (typeof error !== 'object' || error === null) return false;
  if (!('code' in error)) return false;

  return (error as { code?: unknown }).code === 11000;
};


//? Create the token for the email verifications (Im using 32 bytes in hex)
const createVerificationToken = (): string => crypto.randomBytes(32).toString('hex');

//? Hashing the raw tokens for verifications security
const hashVerificationToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

//? This is a handler for the creation of the link (url)+(token in param)
const buildVerificationLink = (rawToken: string): string => {
  const verificationUrl = new URL(config.email_verification_url);
  verificationUrl.searchParams.set('token', rawToken);
  return verificationUrl.toString();
};


class UserController {
  //? Register method for user creation and verifications (Adding the email hashing)
  static async signin(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password } = req.body; //? Change for method of signin

      if (!username || !email || !password) {
        res.status(400).json({ message: 'Some variable in the body is missing' }); return;
      }

      //? Creation of email verification
      const rawVerificationToken = createVerificationToken();
      const verificationTokenHash = hashVerificationToken(rawVerificationToken); //? Hashing the token
      const verificationExpiresAt = new Date(Date.now() + config.email_verification_token_ttl_ms); //? Date limit for the token

      //? Creation of the user in the database
      const createdUser = await Users.create({
        username,
        email,
        passwordHash: password,
        isEmailVerified: false,
        emailVerificationTokenHash: verificationTokenHash,
        emailVerificationExpiresAt: verificationExpiresAt
      });

      //? Getting the verification link for sending an email
      const verificationLink = buildVerificationLink(rawVerificationToken);
      //? Create the html to send
      const emailTemplate = buildEmailVerificationTemplate({
        username: createdUser.username,
        verificationUrl: verificationLink
      });

      //? Logic for sending the email
      let emailSent = true;
      try {
        await sendTransactionalEmail({
          toEmail: createdUser.email,
          toName: createdUser.username,
          subject: emailTemplate.subject,
          htmlContent: emailTemplate.html,
          textContent: emailTemplate.text
        });
      } catch (sendError: unknown) {
        emailSent = false;
        console.error('Error sending verification email -> ', sendError);
      }

      //? Correct method return
      res.status(201).json({
        redirect: '/login',
        username: createdUser.username,
        message: emailSent
          ? 'Account created. Check your inbox to verify your email.'
          : 'Account created, but we could not send the verification email. Request a new verification email.'
      });
    } catch (error: unknown) {
      //? Incorrect method return
      if (isMongoDuplicateKeyError(error)) {
        res.status(409).json({ message: 'Username or email already exists' });
        return;
      }

      console.error('Error registering user -> ', error); //!!
      res.status(400).json({ message: 'Internal error' });
    }
  }


  //? Verification login for users that are already created
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ message: 'email and password are required' });
        return;
      }

      //? Check in the database for the user with the email [already index in that]
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' }); return;
      }

      //? Check if the password is correct for the email provided
      const isValidPassword = await verifyPassword(user.passwordHash, password);
      if (!isValidPassword) {
        res.status(401).json({ message: 'Invalid credentials' }); return;
      }

      //? If the email is not verify then send a different error
      if (!user.isEmailVerified) {
        res.status(403).json({
          message: 'Email not verified. Verify your email before logging in.'
        }); return;
      }

      //? Create the jwt token
      const token = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          username: user.username
        },
        config.jwt_secret,
        { expiresIn: config.jwt_time }
      );

      //? Return the token in the cookie, with a secure and other configurations
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: config.cookie_secure,
        domain: config.cookie_domain,
        sameSite: 'lax',
        maxAge: config.cookie_time
      });

      //? Correct method return
      res.status(200).json({ message: 'Status of login is successfull' });
    } catch (error: unknown) {
      //? Incorrect method return
      console.error('Error logging in -> ', error); //!!
      res.status(500).json({ message: 'Error logging in. Try again.' });
    }
  }


  //? Revoke the cookie from the user
  static logout(_req: Request, res: Response): void {
    res.clearCookie('auth_token', { domain: config.cookie_domain });
    res.status(200).json({ message: 'Logout successful' });
  }


  //? Method for verify the email for individual user
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      //? Get the token from the query of the redirection
      const token = typeof req.query.token === 'string' ? req.query.token : '';
      if (!token) {
        res.status(400).json({ message: 'Verification token is required' }); return;
      }

      //? Verify the token first the hash and then the email
      const tokenHash = hashVerificationToken(token);
      const user = await Users.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: { $gt: new Date() }
      });

      if (!user) {
        res.status(400).json({ message: 'Token is invalid or expired' }); return;
      }

      //? Update the user in the database and save
      user.isEmailVerified = true;
      user.emailVerificationTokenHash = null;
      user.emailVerificationExpiresAt = null;
      await user.save();

      //? Correct method return
      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error: unknown) {
      //? Incorrect method return
      console.error('Error verifying email -> ', error);
      res.status(500).json({ message: 'Internal error' });
    }
  }


  //? Method for resend the verification for user
  static async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'email is required' });
        return;
      }

      //? Check for errors of the verifications
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(200).json({ message: 'If the account exists, a verification email was sent.' }); return;
      }
      if (user.isEmailVerified) {
        res.status(200).json({ message: 'Email is already verified.' }); return;
      }

      //? Recreation of the datas of the email
      const rawVerificationToken = createVerificationToken();
      user.emailVerificationTokenHash = hashVerificationToken(rawVerificationToken);
      user.emailVerificationExpiresAt = new Date(Date.now() + config.email_verification_token_ttl_ms);
      await user.save();

      //? Create the verification link and the html
      const verificationLink = buildVerificationLink(rawVerificationToken);
      const emailTemplate = buildEmailVerificationTemplate({
        username: user.username,
        verificationUrl: verificationLink
      });

      //? Send the email and wait
      await sendTransactionalEmail({
        toEmail: user.email,
        toName: user.username,
        subject: emailTemplate.subject,
        htmlContent: emailTemplate.html,
        textContent: emailTemplate.text
      });

      //? Correct method return
      res.status(200).json({ message: 'Verification email sent successfully.' });
    } catch (error: unknown) {
      //? Incorrect method return
      console.error('Error resending verification email -> ', error);
      res.status(500).json({ message: 'Internal error' });
    }
  }

  //? Quick test helper: remove a user by email
  static async removeUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ message: 'email is required' });
        return;
      }

      const deletedUser = await Users.findOneAndDelete({ email });
      if (!deletedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({ message: 'User deleted successfully', email: deletedUser.email });
    } catch (error: unknown) {
      console.error('Error deleting user by email -> ', error);
      res.status(500).json({ message: 'Internal error' });
    }
  }
}

export default UserController;