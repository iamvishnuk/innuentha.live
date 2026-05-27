import { Http2ServerRequest } from 'http2';
import { HTTPSTATUS } from '../config/http';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.NOT_FOUND) {
    super(message, statusCode);
    this.name = 'NotFoundError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.BAD_REQUEST) {
    super(message, statusCode);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.UNAUTHORIZED) {
    super(message, statusCode);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.FORBIDDEN) {
    super(message, statusCode);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.CONFLICT) {
    super(message, statusCode);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.CONFLICT) {
    super(message, statusCode);
    this.name = 'UnprocessableEntityError';
  }
}

export class InternalServerError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
    this.name = 'InternalServerError';
  }
}

export class NotImplementedError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.NOT_IMPLEMENTED
  ) {
    super(message, statusCode);
    this.name = 'NotImplementedError';
  }
}

export class BadGatewayError extends AppError {
  constructor(message: string, statusCode: number = HTTPSTATUS.BAD_GATEWAY) {
    super(message, statusCode);
    this.name = 'BadGatewayError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.SERVICE_UNAVAILABLE
  ) {
    super(message, statusCode);
    this.name = 'ServiceUnavailableError ';
  }
}

export class GatewayTimeoutError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.GATEWAY_TIMEOUT
  ) {
    super(message, statusCode);
    this.name = 'GatewayTimeoutError';
  }
}

export class TooManyRequestsError extends AppError {
  constructor(
    message: string,
    statusCode: number = HTTPSTATUS.TOO_MANY_REQUESTS
  ) {
    super(message, statusCode);
    this.name = 'TooManyRequestsError';
  }
}

