import { User } from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { getOrCreateProgress, checkAndAwardAchievement } from '../services/progressService.js';
import { env } from '../config/env.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Security: Never permit public registration as admin
    if (role === 'admin') {
      return sendError(res, 'Administrator accounts cannot be created via public registration.', 403);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists.', 409);
    }

    const passwordHash = await User.hashPassword(password);
    const assignedRole = role === 'instructor' ? 'instructor' : 'learner';

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: assignedRole,
      status: 'active'
    });

    // Initialize progress record & award welcome achievement
    const progress = await getOrCreateProgress(user._id);
    await checkAndAwardAchievement(
      progress,
      'first-login',
      'Welcome Cadet',
      'Joined the CyberShield awareness training platform',
      'Shield'
    );
    await progress.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('cybershield_refresh_token', refreshToken, COOKIE_OPTIONS);

    return sendSuccess(
      res,
      'Registration successful. Welcome to CyberShield!',
      {
        user: user.toSafeObject(),
        accessToken
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    if (user.status !== 'active') {
      return sendError(res, `Account is ${user.status}. Please contact an administrator.`, 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password.', 401);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    // Ensure user has progress initialized
    await getOrCreateProgress(user._id);

    res.cookie('cybershield_refresh_token', refreshToken, COOKIE_OPTIONS);

    return sendSuccess(res, 'Logged in successfully', {
      user: user.toSafeObject(),
      accessToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    if (req.user) {
      req.user.refreshToken = null;
      await req.user.save();
    }
    res.clearCookie('cybershield_refresh_token', COOKIE_OPTIONS);
    res.clearCookie('cybershield_access_token', COOKIE_OPTIONS);

    return sendSuccess(res, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, 'User profile retrieved', {
      user: req.user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.cybershield_refresh_token || req.body.refreshToken;
    if (!token) {
      return sendError(res, 'Refresh token required', 401);
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid or expired refresh token', 401);
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== 'active') {
      return sendError(res, 'User session invalid', 401);
    }

    const newAccessToken = generateAccessToken(user);
    return sendSuccess(res, 'Token refreshed successfully', {
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, profile } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (profile) {
      if (profile.bio !== undefined) user.profile.bio = profile.bio;
      if (profile.avatar !== undefined) user.profile.avatar = profile.avatar;
      if (profile.title !== undefined) user.profile.title = profile.title;
      if (profile.organization !== undefined) user.profile.organization = profile.organization;
    }

    await user.save();
    return sendSuccess(res, 'Profile updated successfully', {
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};
