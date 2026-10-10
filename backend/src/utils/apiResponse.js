export const sendSuccess = (res, message = 'Success', data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

export const sendPaginated = (res, message = 'Data retrieved', items = [], pagination = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: items,
    pagination: {
      total: pagination.total || 0,
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 10))
    }
  });
};
