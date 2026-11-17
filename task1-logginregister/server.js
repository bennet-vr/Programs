require('dotenv').config();

const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./src/db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = 'login_session';
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

if (!JWT_SECRET || JWT_SECRET.length < 32 || JWT_SECRET === 'replace_this_with_a_long_random_secret_value') {
  console.error('Please set JWT_SECRET in your .env file to a random value of at least 32 characters.');
  process.exit(1);
}

app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

app.use('/api', apiLimiter);

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict',
  path: '/',
  maxAge: SESSION_DURATION_MS
};

function createSessionToken(user) {
  return jwt.sign(
    { userId: user.id },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

function getUserFromRequest(req) {
  const cookieHeader = req.headers.cookie || '';
  const tokenCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!tokenCookie) return null;

  try {
    const token = decodeURIComponent(tokenCookie.slice(COOKIE_NAME.length + 1));
    const payload = jwt.verify(token, JWT_SECRET);
    return db.prepare('SELECT id, name, email, created_at FROM users WHERE id = ?')
      .get(payload.userId) || null;
  } catch {
    return null;
  }
}

function requireAuthentication(req, res, next) {
  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ message: 'Please log in to continue.' });
  }
  req.user = user;
  next();
}

// Register a new user. Passwords are hashed before they are stored.
app.post('/api/auth/register', authLimiter, async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (name.length < 2 || name.length > 60) {
      return res.status(400).json({ message: 'Name must be between 2 and 60 characters.' });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email) || email.length > 254) {
      return res.status(400).json({ message: 'Enter a valid email address.' });
    }

    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ message: 'Password must contain at least 8 characters and no more than 72 UTF-8 bytes.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const result = db.prepare(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)'
      ).run(name, email, passwordHash);

      return res.status(201).json({
        message: 'Registration successful. Please log in with your new account.',
        userId: Number(result.lastInsertRowid)
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({ message: 'An account with this email already exists.' });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

// Log in an existing user and issue an HTTP-only session cookie.
app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!email || !password) {
      return res.status(400).json({ message: 'Enter both email and password.' });
    }

    const user = db.prepare(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?'
    ).get(email);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = createSessionToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions);

    return res.json({
      message: 'Login successful.',
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    next(error);
  }
});

// Return the currently logged-in user's public profile.
app.get('/api/auth/me', (req, res) => {
  const user = getUserFromRequest(req);
  if (!user) return res.status(401).json({ message: 'Not logged in.' });
  return res.json({ user });
});

// Log out by clearing the session cookie.
app.post('/api/auth/logout', requireAuthentication, (req, res) => {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    path: '/'
  });
  return res.json({ message: 'You have been logged out.' });
});

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found.' });
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Login and registration app running at http://localhost:${PORT}`);
});
