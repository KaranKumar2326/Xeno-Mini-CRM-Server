// src/routes/auth.routes.ts
import { Router } from 'express';
import {
  googleLogin,
  googleCallback,
  loginFailed
} from '../controllers/auth.controller';

const router = Router();

// Initiate Google OAuth
router.get('/google', googleLogin);

// Google OAuth callback
router.get('/google/callback', googleCallback);

// Failed authentication
router.get('/login/failed', loginFailed);

export default router;