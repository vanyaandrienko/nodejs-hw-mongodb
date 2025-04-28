import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,
    });
    next();
  } catch (err) {
    const errorMessages = err.details.map(e => e.message);
    next(createHttpError(400, `Validation Error`, { errors: errorMessages }));
  }
};