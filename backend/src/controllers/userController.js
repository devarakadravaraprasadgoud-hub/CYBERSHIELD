import { User } from '../models/User.js';
import { QuizAttempt } from '../models/QuizAttempt.js';
import { sendSuccess, sendError, sendPaginated } from '../utils/apiResponse.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, role, status, search = '' } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select('-passwordHash -refreshToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
    ]);

    // Attach attempt count
    const enrichedUsers = await Promise.all(
      users.map(async (u) => {
        const attemptCount = await QuizAttempt.countDocuments({ user: u._id });
        return {
          ...u,
          totalAttempts: attemptCount
        };
      })
    );

    return sendPaginated(res, 'Users retrieved successfully', enrichedUsers, {
      total,
      page: pageNum,
      limit: limitNum
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Self or Admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
      return sendError(res, 'Forbidden', 403);
    }

    const user = await User.findById(id).select('-passwordHash -refreshToken').lean();
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const totalAttempts = await QuizAttempt.countDocuments({ user: id });

    return sendSuccess(res, 'User retrieved', {
      ...user,
      totalAttempts
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, status } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent modifying own admin privileges to lock self out
    if (req.user._id.toString() === id) {
      if (status && status !== 'active') {
        return sendError(res, 'You cannot deactivate your own administrative account.', 400);
      }
      if (role && role !== 'admin') {
        return sendError(res, 'You cannot demote your own administrative role.', 400);
      }
    }

    if (role && ['learner', 'instructor', 'admin'].includes(role)) {
      user.role = role;
    }

    if (status && ['active', 'inactive', 'suspended'].includes(status)) {
      user.status = status;
    }

    await user.save();
    return sendSuccess(res, 'User account updated successfully', user.toSafeObject());
  } catch (error) {
    next(error);
  }
};
