import Joi from "joi";

export const newRegistrySchema = Joi.object({
    name: Joi.string().required(),
    amount: Joi.number().greater(0).required(),
    type: Joi.string().valid('entrada', 'saida').required()
});