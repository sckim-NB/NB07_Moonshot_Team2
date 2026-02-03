export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(422, message);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error') {
    super(500, message);
  }
}

// 400 Bad Request
export class InvalidRequestError extends BadRequestError {
  constructor() {
    super('잘못된 요청입니다');
  }
}

export class InvalidDataFormatError extends BadRequestError {
  constructor() {
    super('잘못된 데이터 형식');
  }
}

export class EmailAlreadyExistsError extends BadRequestError {
  constructor() {
    super('이미 가입한 이메일입니다.');
  }
}

// 401 Unauthorized
export class TokenExpiredError extends UnauthorizedError {
  constructor() {
    super('토큰 만료');
  }
}

export class LoginRequiredError extends UnauthorizedError {
  constructor() {
    super('로그인이 필요합니다');
  }
}

// 403 Forbidden
export class NotProjectMemberError extends ForbiddenError {
  constructor() {
    super('프로젝트 멤버가 아닙니다');
  }
}

export class NotProjectOwnerError extends ForbiddenError {
  constructor() {
    super('프로젝트 관리자가 아닙니다');
  }
}

export class NotCommentOwnerError extends ForbiddenError {
  constructor(action: 'update' | 'delete') {
    super(`자신이 작성한 댓글만 ${action === 'update' ? '수정' : '삭제'}할 수 있습니다`);
  }
}

// 404 Not Found
export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('존재하지 않는 유저입니다');
  }
}

export class InvalidCredentialsError extends NotFoundError {
  constructor() {
    super('존재하지 않거나 비밀번호가 일치하지 않습니다');
  }
}
