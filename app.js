// app.js
require('dotenv').config();
require('express-async-errors'); // capture thrown async errors -> our JSON handler

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const logger = require('./modules/logger');

// ---- Project modules (as-is) ----
const { routes } = require('./config/Routes');
const initSwagger = require('./config/swagger');
const { Base } = require('./middlewares/Base');
const webhookRouter = require('./features/payment/controller/Webhook.Controller');

// ---- Error middlewares (JSON-first) ----
const notFound       = require('./middlewares/notFound.middleware');
const errorLogger    = require('./middlewares/errorLoggingMiddleware');  // logs only
const errorConverter = require('./middlewares/errorConverter');          // normalize DB/validation
const errorHandler   = require('./middlewares/errorHandler');            // final JSON responder

const app = express();

// ---- Security & CORS ----
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : '*',
    credentials: true,
  })
);

// ---- Static (keep if you use it) ----
app.use('/public', express.static(path.join(__dirname, 'public')));

// ---- Webhooks BEFORE global parsers if they need raw body ----
app.use('/webhooks', webhookRouter);

// ---- Base init (parsers, cookies, DB, auth, etc.) ----
Base.init(app);

/**
 * AUTH SHIM (non-invasive):
 * If Base.authenticate didn't attach req.user (e.g., due to an unless path),
 * but a Bearer token is present, decode it and attach the decoded payload.
 * This makes rolecheck.middleware see `req.user.userType` again.
 */
app.use((req, _res, next) => {
  try {
    if (!req.user) {
      const auth = req.headers.authorization || req.headers.Authorization;
      if (auth && auth.startsWith('Bearer ')) {
        const token = auth.slice('Bearer '.length);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // decoded comes from helper.createToken: { email, user: _id, name, userType: roleId.name }
        req.user = decoded;
      }
    }
  } catch (e) {
    // Don’t block the request here; let downstream middleware decide (401/403/whatever)
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

// ---- JSON error pipeline (order matters) ----
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

// ---- Crash guards ----
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
