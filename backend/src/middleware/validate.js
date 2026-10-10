import { sendError } from '../utils/apiResponse.js';

export const validateBody = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return sendError(res, 'Validation failed', 400, errorMessages);
      }
      return sendError(res, err.message || 'Invalid request body', 400);
    }
  };
};

export const validateQuery = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req.query);
      req.query = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return sendError(res, 'Invalid query parameters', 400, errorMessages);
      }
      return sendError(res, err.message || 'Invalid query parameters', 400);
    }
  };
};
