const AppError = require('../utils/app-error');

const validate = (schema, source) => (req, res, next) => {
  const parsed = schema.safeParse(req[source]);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => ({
      field: issue.path.join('.') || source,
      message: issue.message,
    }));
    return next(new AppError('Validation failed.', 400, errors));
  }
  // Express 5 exposes req.query through a getter, so assigning a replacement
  // object to req.query does not reliably preserve Zod's parsed defaults.
  // Keep parsed input in an explicit request namespace for every source.
  req.validated = req.validated || {};
  req.validated[source] = parsed.data;
  return next();
};

module.exports = validate;
