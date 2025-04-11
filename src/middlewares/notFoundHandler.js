import { HttpError } from 'http-errors';

export const notFoundHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(404).json({
      status: 404,
      message: "Contact not found"
    });
    return;
  }
  };