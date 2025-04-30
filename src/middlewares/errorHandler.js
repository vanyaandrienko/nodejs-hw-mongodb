export const errorHandler = (error, request, response, next) => {
    const { status = 500, message = "Server eror" } = error;
    response.status(status).json({
        message,
    });
};