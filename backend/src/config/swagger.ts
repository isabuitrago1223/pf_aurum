import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aurum API',
      version: '1.0.0',
      description:
        'Documentación de la API de Aurum para autenticación, productos, categorías, ocasiones, pedidos, pagos e imágenes.'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Servidor local'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts']
});