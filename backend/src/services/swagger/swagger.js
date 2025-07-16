const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Voyager - AI Smart Ship API',
    version: '1.0.0',
    description: 'An intelligent backend service that uses AI to optimize voyage planning, fuel usage, and maintenance scheduling for commercial vessels.',
  },
  servers: [
    { url: 'http://13.53.122.82:3000', description: 'Deployed server'},
    { url: 'http://localhost:3000', description: 'Local server' }
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/services/swagger/*.swagger.js'],
};
const swaggerSpec = swaggerJSDoc(options);

function setupSwaggerDocs(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = setupSwaggerDocs; 