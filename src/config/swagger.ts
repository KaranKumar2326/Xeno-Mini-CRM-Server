import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API',
      version: '1.0.0',
      description: 'Data Ingestion APIs with Redis Pub-Sub',
    },
    servers: [
      { url: 'http://localhost:3001' },
      { url: 'https://xeno-mini-crm-server.onrender.com' }
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to your route files
};

export const swaggerSpec = swaggerJsdoc(options);
