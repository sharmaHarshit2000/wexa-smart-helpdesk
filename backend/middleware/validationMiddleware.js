const { registerSchema, loginSchema, articleSchema, ticketSchema, configSchema } = require('../validation/schemas');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: 'Validation error',
      details: error.details.map(detail => detail.message)
    });
  }
  next();
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateArticle: validate(articleSchema),
  validateTicket: validate(ticketSchema),
  validateConfig: validate(configSchema)
};