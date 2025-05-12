import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

// Extend the Express Request type to include the user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Match the audience
    });

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = payload; // Store user info in request
    next(); // Continue to the next middleware or route handler
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ error: 'Unauthorized', details: error instanceof Error ? error.message : 'Unknown error' });
  }
};