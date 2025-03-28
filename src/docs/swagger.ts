import swaggerJSDoc from 'swagger-jsdoc';
import { config } from '../config/env';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Project Management API',
      version: '1.0.0',
      description: 'Documentation for your project management API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
      {
        url: config.apiBaseUrl,
        description: 'Server from environment',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['src/modules/**/*.ts'], // ⬅️ Di-scan untuk JSDoc comment
};

export const swaggerSpec = swaggerJSDoc(options);
