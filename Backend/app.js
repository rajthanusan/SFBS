const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport'); // Add passport
const session = require('express-session'); // Add session
const cors = require('cors');

// Google OAuth Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User'); // Assuming User model is in models/User

const app = express();

// CORS setup
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

// Connect Database
connectDB();

// Init Middleware
app.use(bodyParser.json());
app.use(express.json());

// Serve static files from the uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Session Middleware
app.use(session({
  secret: 'your-session-secret',
  resave: false,
  saveUninitialized: true,
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google Strategy for Passport
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/v1/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });


      // If user does not exist, create a new one
      if (!user) {
        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'User', // Set default role as 'User'
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// Define Routes
app.use('/api/v1/auth', require('./routes/authRoutes'));
app.use('/api/v1/user', require('./routes/userRoutes'));
app.use('/api/v1/facilities', require('./routes/facilityRoutes'));
app.use('/api/v1/equipment', require('./routes/equipmentRoutes'));
app.use('/api/v1/equipment-booking', require('./routes/equipmentBookingRoutes'));
app.use('/api/v1/facility-booking', require('./routes/facilityBookingRoutes'));
app.use('/api/v1/coach-profile', require('./routes/coachProfileRoutes'));
app.use('/api/v1/session', require('./routes/sessionRoutes'));
app.use('/api/v1/reviews', require('./routes/reviewRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
