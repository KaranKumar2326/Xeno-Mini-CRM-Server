import { Request, Response } from 'express';
import passport from 'passport';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Load frontend URL from environment variable
const FRONTEND_URL = process.env.FRONTEND_URL;
console.log('[BACKEND] Frontend URL:', FRONTEND_URL);

// Extend the Request interface for session data
declare global {
  namespace Express {
    interface SessionData {
      user?: any;
    }
    interface Request {
      session: SessionData;
    }
  }
}



// Google authentication route
export const googleAuth = (req: Request, res: Response) => {
  console.log('[BACKEND] /auth/google endpoint hit');
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent', // Ensures the user is prompted for consent
  })(req, res);
};

// Google callback route after successful authentication
export const googleCallback = (req: Request, res: Response) => {
  console.log('[BACKEND] /auth/google/callback endpoint hit');
  console.log('Callback query params:', req.query);

  passport.authenticate(
    'google',
    {
      failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
      session: false,  // We don’t need to store user in session here
    },
    (err: any, user: any, info: any) => {
      console.log('Passport authenticate callback executed');
      console.log('Error:', err);
      console.log('User:', user);
      console.log('Info:', info);

      if (err) {
        console.error('Authentication error:', err);
        return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
      }

      if (!user) {
        console.error('No user returned from Google');
        return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
      }

      try {
        console.log('Successful authentication, user:', user);

        // Generate a JWT token after successful authentication
        const token = jwt.sign(
          { id: user.id, email: user.emails[0].value, displayName: user.displayName, photo: user.photos[0].value },
          process.env.JWT_SECRET || 'secret-key', // Use a secret key for signing the JWT
          { expiresIn: '1h' } // Set expiration time for the token (optional)
        );

        // Redirect to frontend with token
        res.redirect(`${FRONTEND_URL}/login?token=${token}`);
      } catch (sessionError) {
        console.error('Session error:', sessionError);
        res.redirect(`${FRONTEND_URL}/login?error=session_error`);
      }
    }
  )(req, res);
};
