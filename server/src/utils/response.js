const successResponse = (data, message = 'Success') => ({
  success: true,
  message,
  data
});

const errorResponse = (message, error = null) => ({
  success: false,
  message,
  error: error?.message || error
});

const paginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = parseInt(page);
  
  return {
    success: true,
    data,
    pagination: {
      total,
      page: currentPage,
      limit: parseInt(limit),
      totalPages,
      hasNext: currentPage < totalPages,
      hasPrev: currentPage > 1
    }
  };
};

module.exports = {
  successResponse,
  errorResponse,
  paginationResponse
};