import { sendError } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Unauthorized. Please log in.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        `Forbidden. Access restricted to: [${roles.join(', ')}]. Your role is: ${req.user.role}`,
        403
      );
    }

    next();
  };
};
