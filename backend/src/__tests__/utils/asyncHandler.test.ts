import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';

describe('asyncHandler', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('비동기 함수를 성공적으로 처리해야 함', async () => {
    const mockHandler = jest.fn().mockResolvedValue('success');
    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('에러를 캐치하여 next()로 전달해야 함', async () => {
    const error = new Error('Test error');
    const mockHandler = jest.fn().mockRejectedValue(error);
    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockHandler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('Promise.reject 에러를 처리해야 함', async () => {
    const error = new Error('Promise rejection');
    const mockHandler = jest.fn(() => Promise.reject(error));
    const wrappedHandler = asyncHandler(mockHandler);

    await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });

  it('핸들러의 반환값을 전달해야 함', async () => {
    const returnValue = { data: 'test' };
    const mockHandler = jest.fn().mockResolvedValue(returnValue);
    const wrappedHandler = asyncHandler(mockHandler);

    const result = await wrappedHandler(mockReq as Request, mockRes as Response, mockNext);

    expect(result).toBe(returnValue);
  });
});
