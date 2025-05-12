// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

export const googleLogin = (req: Request, res: Response) => {
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'consent',
    session: false
  })(req, res);
};

export const googleCallback = (req: Request, res: Response) => {
  passport.authenticate('google', {
    failureRedirect: '/login/failed',
    session: false
  }, (err: any, user: any) => {
    if (err || !user) {
      console.error('Google auth failed:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1h' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${token}`);
  })(req, res);
};

export const loginFailed = (req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: 'Google authentication failed'
  });
};