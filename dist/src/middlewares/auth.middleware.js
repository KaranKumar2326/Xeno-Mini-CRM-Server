"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
const google_auth_library_1 = require("google-auth-library");
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const requireAuth = async (req, res, next) => {
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
    }
    catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Unauthorized', details: error instanceof Error ? error.message : 'Unknown error' });
    }
};
exports.requireAuth = requireAuth;
