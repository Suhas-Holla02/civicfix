import jwt from 'jsonwebtoken';
import { config } from '../config/config.js';
import { dbAdapter } from '../models/dbAdapter.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await dbAdapter.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account no longer exists or session expired.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Unauthorized. Required role: ${allowedRoles.join(' or ')}. Your role: ${req.user.role}` 
      });
    }
    next();
  };
}

export const requireAdminOrOfficer = requireRole('ADMIN', 'OFFICER');
export const requireAdmin = requireRole('ADMIN');
