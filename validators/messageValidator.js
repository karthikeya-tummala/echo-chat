import Joi from 'joi';

const messageSchema = Joi.object({
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
    .messages({
      'string.empty': 'Message cannot be empty.',
      'string.min': 'Message must be at least 1 character long.',
      'string.max': 'Message must be less than or equal to 500 characters.',
      'any.required': 'Message is required.'
    })
});

export default (data) => {
  const { error } = messageSchema.validate(data);
  if (error) return error.details[0].message;
  
  return null;
};
