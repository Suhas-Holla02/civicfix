import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbAdapter } from '../models/dbAdapter.js';
import { config } from '../config/config.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'CITIZEN', department = null } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await dbAdapter.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Only existing admins can create ADMIN/OFFICER accounts; default to CITIZEN
    const safeRole = ['ADMIN', 'OFFICER'].includes(role) ? role : 'CITIZEN';

    const newUser = await dbAdapter.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password_hash,
      role: safeRole,
      department: safeRole === 'OFFICER' ? department : null
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account successfully registered',
      token,
      user: newUser
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await dbAdapter.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      created_at: user.created_at
    };

    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}
