const { Prisma } = require('@prisma/client');

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
};

const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'An unexpected error occurred.';
  let errors = error.errors;

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'A record with this value already exists.';
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Requested resource was not found.';
    } else {
      statusCode = 500;
      message = 'A database error occurred.';
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid database request.';
  } else if (!error.isOperational) {
    statusCode = 500;
    message = 'An unexpected error occurred.';
  }

  const response = { success: false, message };
  if (errors) response.errors = errors;
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) response.errors = [{ message: error.message }];
  res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
