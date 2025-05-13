"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Xeno CRM API',
            version: '1.0.0',
            description: 'Data Ingestion APIs with Redis Pub-Sub',
        },
        servers: [{ url: 'http://localhost:3001' }],
    },
    apis: ['./src/routes/*.ts'], // Path to your route files
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
