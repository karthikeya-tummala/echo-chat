import Joi from 'joi';

const roomNameSchema = Joi.object({
  roomName: Joi.string()
    .uppercase()
    .length(6)
    .required()
    .messages({
      'string.empty': 'Room name cannot be empty.',
      'string.length': 'Room name must be exactly 6 characters long.',
      'any.required': 'Room name is required.'
    })
});

export default (data) => {
  const { error } = roomNameSchema.validate(data);
  if (error) return error.details[0].message;
  
  return null;
};