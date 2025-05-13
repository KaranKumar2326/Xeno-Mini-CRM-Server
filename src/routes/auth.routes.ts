// routes/auth.ts
import { Router } from 'express';
import { googleAuth, googleCallback } from '../controllers/auth.controller';

const router = Router();

router.get('/google', (req, res) => {
  console.log('Google auth route hit');
  googleAuth(req, res);
});

router.get('/google/callback', (req, res) => {
  console.log('Google callback route hit');
  googleCallback(req, res);
}); 

export default router;