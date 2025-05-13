"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleCallback = exports.googleAuth = void 0;
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
// Load frontend URL from environment variable
const FRONTEND_URL = process.env.FRONTEND_URL;
// Google authentication route
const googleAuth = (req, res) => {
    console.log('[BACKEND] /auth/google endpoint hit');
    passport_1.default.authenticate('google', {
        scope: ['profile', 'email'],
        accessType: 'offline',
        prompt: 'consent', // Ensures the user is prompted for consent
    })(req, res);
};
exports.googleAuth = googleAuth;
// Google callback route after successful authentication
const googleCallback = (req, res) => {
    console.log('[BACKEND] /auth/google/callback endpoint hit');
    console.log('Callback query params:', req.query);
    passport_1.default.authenticate('google', {
        failureRedirect: `${FRONTEND_URL}/login?error=auth_failed`,
        session: false, // We don’t need to store user in session here
    }, (err, user, info) => {
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
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.emails[0].value }, process.env.JWT_SECRET || 'secret-key', // Use a secret key for signing the JWT
            { expiresIn: '1h' } // Set expiration time for the token (optional)
            );
            // Redirect to frontend with token
            res.redirect(`${FRONTEND_URL}/login?token=${token}`);
        }
        catch (sessionError) {
            console.error('Session error:', sessionError);
            res.redirect(`${FRONTEND_URL}/login?error=session_error`);
        }
    })(req, res);
};
exports.googleCallback = googleCallback;
