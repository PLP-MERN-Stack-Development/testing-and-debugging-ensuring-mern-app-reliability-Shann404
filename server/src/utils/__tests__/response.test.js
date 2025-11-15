const {
  successResponse,
  errorResponse,
  paginationResponse
} = require('../response');

describe('Response Utilities', () => {
  describe('successResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = successResponse(data, 'Operation successful');

      expect(response).toEqual({
        success: true,
        message: 'Operation successful',
        data: data
      });
    });

    it('should create success response without message', () => {
      const data = { id: 1 };
      const response = successResponse(data);

      expect(response).toEqual({
        success: true,
        message: 'Success',
        data: data
      });
    });
  });

  describe('errorResponse', () => {
    it('should create error response with message', () => {
      const response = errorResponse('Error occurred');

      expect(response).toEqual({
        success: false,
        message: 'Error occurred',
        error: null
      });
    });

    it('should create error response with error object', () => {
      const error = new Error('Detailed error');
      const response = errorResponse('Operation failed', error);

      expect(response).toEqual({
        success: false,
        message: 'Operation failed',
        error: 'Detailed error'
      });
    });
  });

  describe('paginationResponse', () => {
    it('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const total = 50;
      const page = 2;
      const limit = 10;

      const response = paginationResponse(data, total, page, limit);

      expect(response).toEqual({
        success: true,
        data: data,
        pagination: {
          total,
          page,
          limit,
          totalPages: 5,
          hasNext: true,
          hasPrev: true
        }
      });
    });

    it('should calculate correct pagination flags', () => {
      const data = [];
      const total = 15;
      const page = 1;
      const limit = 10;

      const response = paginationResponse(data, total, page, limit);

      expect(response.pagination).toEqual({
        total: 15,
        page: 1,
        limit: 10,
        totalPages: 2,
        hasNext: true,
        hasPrev: false
      });
    });
  });
});