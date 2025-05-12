// src/config/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import Customer from '../models/Customer';
import dotenv from 'dotenv';

dotenv.config();

// Validate environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
  throw new Error('Missing Google OAuth environment variables');
}

console.log('Google OAuth Config:');
console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Callback URL:', process.env.GOOGLE_CALLBACK_URL);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  passReqToCallback: true
}, async (req: any, accessToken: string, refreshToken: string, profile: any, done: Function) => {
  try {
    console.log('Google profile received:', profile.id);
    
    if (!profile.emails || profile.emails.length === 0) {
      return done(new Error('No email found in Google profile'), false);
    }

    const email = profile.emails[0].value;
    let customer = await Customer.findOne({ email });

    if (!customer) {
      customer = new Customer({
        name: profile.displayName,
        email,
        googleId: profile.id,
        totalSpend: 0,
        visitCount: 1,
        segments: [],
      });
    } else {
      customer.visitCount += 1;
    }

    await customer.save();
    return done(null, customer);

  } catch (err) {
    console.error('Error in Google Strategy:', err);
    return done(err, false);
  }
}));

// Serialization
passport.serializeUser((customer: any, done) => {
  done(null, customer.id);
});

// Deserialization
passport.deserializeUser(async (id: string, done) => {
  try {
    const customer = await Customer.findById(id);
    done(null, customer);
  } catch (err) {
    done(err, null);
  }
});

export default passport;