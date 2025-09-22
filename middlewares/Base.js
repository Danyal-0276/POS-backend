// middlewares/Base.js
'use strict';
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { unless } = require('express-unless');
const jwt = require('jsonwebtoken');
const connectDB = require('../config/db');
const { httpsCodes } = require('../modules/constants');
const { language } = require('../language/language');

class Base {
  static async init(app) {
    app.use(bodyParser.json({ limit: '100mb' }));
    app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
    app.use(cookieParser());

    await connectDB();

    Base.authenticate.unless = unless;
    app.use(
      Base.authenticate.unless({
        path: [
          { url: '/auth/login', methods: ['GET', 'PUT', 'POST'] },
          { url: '/auth/register', methods: ['GET', 'PUT', 'POST'] },
          { url: '/auth/verify/otp', methods: ['GET', 'PUT', 'POST'] },
          { url: '/auth/reset-password', methods: ['GET', 'PUT', 'POST'] },
          { url: '/auth/forgotPassword', methods: ['GET', 'PUT', 'POST'] },
          { url: '/auth/verifyToken', methods: ['GET', 'PUT', 'POST'] },
          { url: '/role/add', methods: ['GET', 'PUT', 'POST'] },
          { url: '/role/all', methods: ['GET', 'PUT', 'POST'] },
          { url: '/user/add/password', methods: ['GET', 'PUT', 'POST'] },
          { url: '/api-docs', methods: ['GET'] },
          { url: '/swagger.json', methods: ['GET'] },
          { url: '/webhooks/stripe', methods: ['POST'] },
          { url: '/webhooks/coinbase', methods: ['POST'] },
          { url: new RegExp('^/api-docs/.*'), methods: ['GET'] },
          { url: new RegExp('^/uploads/.*'), methods: ['GET', 'PUT', 'POST'] },
        ],
      })
    );

    // Keep simple health route if you want
    app.get('/', (req, res) => res.json('Welcome to Sticha backend'));
  }

  static async authenticate(req, res, next) {
    try {
      if (req.method === 'OPTIONS') return next();
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (!token) {
        return res
          .status(httpsCodes.UNAUTHORIZE_CODE)
          .json({ message: language.INVALID_AUTH_TOKEN });
      }
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
          return res
            .status(httpsCodes.UNAUTHORIZE_CODE)
            .json({ message: language.INVALID_AUTH_TOKEN });
        }
        req.user = user;
        next();
      });
    } catch (error) {
      return res
        .status(httpsCodes.INTERNAL_SERVER_ERROR)
        .json({ message: language.SERVER_ERROR });
    }
  }
}

module.exports = { Base };
