export function errorHandler(err, req, res, next) {
  console.error('[CivicFix Error]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal municipal server error. Please try again later.';

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
