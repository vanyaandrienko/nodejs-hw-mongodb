
export const notFoundHandle = (request, response) => {
    response.status(404).json({
        message: "Route not found"
    });
}