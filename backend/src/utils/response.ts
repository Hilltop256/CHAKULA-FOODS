import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200,
  meta?: ApiResponse['meta'],
): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta && { meta }),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  errors?: unknown,
): Response {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CKF-${timestamp}-${random}`;
}

export function generateConfirmationCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function paginate(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}
