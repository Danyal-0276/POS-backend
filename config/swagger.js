
const swaggerUi    = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerCli   = require('swagger-cli');  

module.exports = async function initSwagger(app) {
  /* Build dynamic server URL */
  const PORT   = process.env.PORT      || 3000;
  const HOST   = process.env.API_HOST  || 'localhost';
  const SCHEME = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const BASE   = process.env.BASE_PATH || '';          
  const SERVER = `${SCHEME}://${HOST}:${PORT}${BASE}`;

  const options = {
    definition: {
      openapi: '3.0.0',
      info: { title: 'STICHA API', version: '1.0.0' },
      servers: [{ url: SERVER }],
      components: {
        securitySchemes: {
          BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        }
      },
      security: [{ BearerAuth: [] }]
    },
    apis: ['./docs/**/*.yaml']   // <── points to your YAML files
  };

  let swaggerSpec;

  try {
    swaggerSpec = swaggerJSDoc(options);
  
    await swaggerCli.validate(swaggerSpec);
    console.log('✅  Swagger specification generated');
  } catch (err) {
    console.error('❌  Swagger spec invalid:', err.message);
    return;                      
  }

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: { persistAuthorization: true }
    })
  );

  app.get('/swagger.json', (_req, res) => res.json(swaggerSpec));
};
