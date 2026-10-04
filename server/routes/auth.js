import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { supabase, supabaseAuth } from '../supabaseServer.js';
import { check, toClient } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Utility function to generate JWT token for AuthContext
const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// REGISTER ROUTE
router.post('/register', async (req, res, next) => {
  try {
    const {
      fullName,
      studentId,
      email,
      program,
      yearLevel,
      password,
      confirmPassword,
      confirm_password
    } = req.body;

    const confirmation = confirmPassword || confirm_password;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    if (confirmation && password !== confirmation) {
      return res.status(400).json({ message: 'Passwords do not match.' });
    }

    // Student IDs are unique; check first so the user gets a clear message
    if (studentId) {
      const taken = check(await supabase.from('profiles').select('id').eq('student_id', studentId).maybeSingle());
      if (taken) return res.status(409).json({ message: 'That student ID is already registered.' });
    }

    // 1. Create user in Supabase Auth (a database trigger creates the profiles row from this metadata)
    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          program: program,
          year_level: yearLevel,
        },
      },
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    const user = data.user;

    if (!user) {
      return res.status(400).json({ message: 'Registration failed. Please check your details.' });
    }

    // 2. No token here: the user must log in with their new credentials.
    // data.session is null when Supabase requires email confirmation first.
    res.status(201).json({
      message: 'Account created successfully.',
      emailConfirmationRequired: !data.session,
      user: {
        id: user.id,
        _id: user.id,
        email: user.email,
        fullName,
        studentId,
        program,
        yearLevel,
      },
    });
  } catch (err) {
    next(err);
  }
});

// LOGIN ROUTE
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // 1. Authenticate using Supabase Auth
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error?.code === 'email_not_confirmed') {
      return res.status(403).json({ message: 'Please verify your email first. Check your inbox for the confirmation link.' });
    }

    // Project/configuration problems (e.g. email provider disabled) should not look like a wrong password
    if (error && error.code !== 'invalid_credentials') {
      return res.status(error.status || 400).json({ message: error.message });
    }

    if (error || !data.user) {
      return res.status(401).json({ message: 'Invalid credentials or account does not exist.' });
    }

    // 2. Load the profile and check banned status
    const profile = check(await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle());

    if (!profile) {
      return res.status(500).json({ message: 'Profile not found. Make sure the database schema has been set up.' });
    }

    if (profile.banned) {
      return res.status(403).json({ message: 'This account has been suspended.' });
    }

    // 3. Return signed JWT token and user details
    res.json({ token: signToken(profile.id), user: toClient(profile) });
  } catch (err) {
    next(err);
  }
});

// GET CURRENT USER ROUTE
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

export default router;
