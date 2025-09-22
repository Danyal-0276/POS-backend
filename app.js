// app.js
require('dotenv').config();
require('express-async-errors'); 
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const logger = require('./modules/logger');


const { routes } = require('./config/Routes');
const initSwagger = require('./config/swagger');
const { Base } = require('./middlewares/Base');



const notFound       = require('./middlewares/notFound.middleware');
const errorLogger    = require('./middlewares/errorLoggingMiddleware');  
const errorConverter = require('./middlewares/errorConverter');          
const errorHandler   = require('./middlewares/errorHandler');            

const app = express();


app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    credentials: true,
  })
);


app.use('/public', express.static(path.join(__dirname, 'public')));




Base.init(app);


app.use((req, _res, next) => {
  try {
    if (!req.user) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.slice('Bearer '.length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
       
        req.user = decoded;
      }
    }
  } catch (e) {

    logger.error('Auth shim failed to decode token', { message: e.message });
  }
  next();
});

// ---- Swagger & routes ----
if (typeof initSwagger === 'function') {
  initSwagger(app).catch((e) => {
    logger.error('Swagger init failed', { message: e.message, stack: e.stack });
  });
}
routes(app);

app.use(notFound);
app.use(errorLogger);
app.use(errorConverter);
app.use(errorHandler);

// ---- Start server ----
const PORT = process.env.PORT || 3000;
const HOST = process.env.API_HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`✅ Server listening on http://${HOST}:${PORT}`);
});


process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', { message: err.message, stack: err.stack });
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', {
    reason: reason?.message || String(reason),
    stack: reason?.stack,
  });
  process.exit(1);
});

module.exports = app;
