import { verifyAccessToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { sendError } from '../utils/apiResponse.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.cybershield_access_token) {
      token = req.cookies.cybershield_access_token;
    }

    if (!token) {
      return sendError(res, 'Authentication required. No token provided.', 401);
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid or expired token. Please log in again.', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 'User not found.', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, `Account is ${user.status}. Please contact support.`, 403);
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Authentication failed', 401);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.cybershield_access_token) {
      token = req.cookies.cybershield_access_token;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user && user.status === 'active') {
          req.user = user;
        }
      }
    }
    next();
  } catch (error) {
    // Silently continue without req.user
    next();
  }
};
