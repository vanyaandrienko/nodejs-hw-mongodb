export const errorHandler = (err, req, res, next) => {
  
  const { status = 500, message = "Something went wrong" } = err;

  res.status(status).json ({
    status,
    message: "Something went wrong",
    data: message
  });
  // res.status(500).json({
  //   status: 500,
  //   message: 'Something went wrong',
  //   data: err.message,
  // });
  };