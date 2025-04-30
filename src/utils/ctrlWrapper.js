export const ctrlWrapper = ctrl => {
    const func = async (request, response, next) => {
        try {
            await ctrl(request, response, next);
        } catch (error) {
            next(error);
        }
    };

    return func;
}
  