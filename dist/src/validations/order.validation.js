"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOrder = void 0;
const joi_1 = __importDefault(require("joi"));
const validateOrder = (data) => {
    const schema = joi_1.default.object({
        customerId: joi_1.default.string().hex().length(24).required(),
        items: joi_1.default.array().items(joi_1.default.object({
            productId: joi_1.default.string().required(),
            name: joi_1.default.string().required(),
            price: joi_1.default.number().min(0).required(),
            quantity: joi_1.default.number().min(1).required()
        })).min(1).required(),
        amount: joi_1.default.number().min(0).required(),
        shippingAddress: joi_1.default.object({
            street: joi_1.default.string().required(),
            city: joi_1.default.string().required(),
            postalCode: joi_1.default.string().optional()
        }).optional()
    });
    return schema.validate(data, { abortEarly: false });
};
exports.validateOrder = validateOrder;
