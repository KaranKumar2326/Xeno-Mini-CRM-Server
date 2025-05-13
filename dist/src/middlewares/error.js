"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    const response = { error: err.message };
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
