"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// lib/passport.ts
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables first
dotenv_1.default.config();
console.log('[PASSPORT] Initializing Google OAuth strategy...');
console.log('[PASSPORT] Checking environment variables...');
// Validate environment variables before creating strategy
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    console.error('[PASSPORT] Missing required environment variables:');
    console.error('- GOOGLE_CLIENT_ID:', !!process.env.GOOGLE_CLIENT_ID);
    console.error('- GOOGLE_CLIENT_SECRET:', !!process.env.GOOGLE_CLIENT_SECRET);
    console.error('- GOOGLE_CALLBACK_URL:', !!process.env.GOOGLE_CALLBACK_URL);
    throw new Error('Missing Google OAuth environment variables');
}
console.log('[PASSPORT] Environment variables verified');
console.log('[PASSPORT] Initializing Google Strategy...');
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => {
    console.log('\n[PASSPORT] Google OAuth callback triggered');
    console.log('[PASSPORT] Access Token:', accessToken ? 'Received' : 'Missing');
    console.log('[PASSPORT] Profile:', {
        id: profile.id,
        displayName: profile.displayName,
        emails: profile.emails,
    });
    // No user storage - just pass the profile through
    console.log('[PASSPORT] Returning user profile to passport');
    return done(null, profile);
}));
console.log('[PASSPORT] Setting up serialization...');
passport_1.default.serializeUser((user, done) => {
    console.log('\n[PASSPORT] Serializing user:', user);
    done(null, user);
});
passport_1.default.deserializeUser((user, done) => {
    console.log('\n[PASSPORT] Deserializing user:', user);
    done(null, user);
});
console.log('[PASSPORT] Configuration complete');
exports.default = passport_1.default;
