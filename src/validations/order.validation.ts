import Joi from 'joi';

export const validateOrder = (data: any) => {
  const schema = Joi.object({
    customerId: Joi.string().hex().length(24).required(),

    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required(),
        name: Joi.string().required(),
        price: Joi.number().min(0).required(),
        quantity: Joi.number().min(1).required()
      })
    ).min(1).required(),

    amount: Joi.number().min(0).required(),

    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      postalCode: Joi.string().optional()
    }).optional()
  });

  return schema.validate(data, { abortEarly: false });
};
