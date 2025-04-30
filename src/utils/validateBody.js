import createHttpError from "http-errors";

export const validateBody = schema => {
    const func = async (request, response, next) => {
        try {
            await schema.validateAsync(request.body, {
                abortEarly: false,
            });
            next();
        } catch (error) {
            next(createHttpError(400, error.message));
        }
    };

    return func;
};