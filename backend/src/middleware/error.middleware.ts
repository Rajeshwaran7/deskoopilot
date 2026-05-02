import { NextFunction, Request, Response } from 'express';

interface ErrorWithStatus extends Error {
  status?: number;
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  let status = 500;
  let message = 'Internal server error';

  if (err instanceof Error) {
    message = err.message;
    const errorWithStatus = err as ErrorWithStatus;
    if (typeof errorWithStatus.status === 'number') {
      status = errorWithStatus.status;
    }
  }

  res.status(status).json({
    success: false,
    error: message
  });
}
