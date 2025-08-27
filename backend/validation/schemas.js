const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'agent', 'user').default('user')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const articleSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  body: Joi.string().min(10).required(),
  tags: Joi.array().items(Joi.string().max(30)),
  status: Joi.string().valid('draft', 'published').default('draft')
});

const ticketSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).required(),
  category: Joi.string().valid('billing', 'tech', 'shipping', 'other').default('other')
});

const configSchema = Joi.object({
  autoCloseEnabled: Joi.boolean().default(true),
  confidenceThreshold: Joi.number().min(0).max(1).default(0.78),
  slahours: Joi.number().min(1).default(24)
});

module.exports = {
  registerSchema,
  loginSchema,
  articleSchema,
  ticketSchema,
  configSchema
};