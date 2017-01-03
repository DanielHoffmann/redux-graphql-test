const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('config');
const bcrypt = require('bcryptjs');
const express = require('express');
const expressSession = require('express-session');
const http = require('http');
const debug = require('debug');
const logger = require('./util/logger');
const db = require('./schema/index');
const responseFormatter = require('./util/responseFormatter');

db.sequelize.sync().then( () => {
   // Seed an admin user
   bcrypt.genSalt(10, ( err, salt ) => {
      bcrypt.hash(config.get('adminPassword'), salt, ( err, hash ) => {
         if ( err ) {
            logger.error('Error while hashing password: %j', { error: err });
         } else {
            db.models.Users.findOrCreate(
               {
                  where: {
                     email: 'admin@globalmouth.com'
                  },
                  defaults: {
                     email: 'admin@globalmouth.com',
                     password_hash: hash,
                     isAdmin: true
                  }
               });
         }
      });
   });

   const app = express();

   // Configuring password hashing
   passport.use(new LocalStrategy(
      ( username, password, cb ) => {
         db.models.Users.findOne({
            where: {
               email: {
                  $iLike: username
               }
            }
         }).then(( user ) => {
            if ( null === user ) {
               return cb(null, false);
            }
            //Check hashed password
            bcrypt.compare(password, user.dataValues.password_hash, function ( err, res ) {
               if ( err ) {
                  return cb(err);
               }
               if ( res ) {
                  return cb(null, user.dataValues);
               }
               return cb(null, false);
            });
         }).error(( err ) => {
            return cb(err);
         });
   }));

   /*
   Configure Passport authenticated session persistence.

   In order to restore authentication state across HTTP requests, Passport needs to serialize users into and deserialize users out of the session.  The typical implementation of this is as simple as supplying the user ID when serializing, and querying the user record by ID from the database when deserializing.
   */
   passport.serializeUser(( user, cb ) => {
      cb(null, user.id);
   });

   passport.deserializeUser(( id, cb ) => {
      db.models.Users.findOne({
         where: {
            id: id
         }
      }).then(( user ) => {
         if ( null === user ) {
            return cb(null, false);
         }
         return cb(null, user.dataValues);
      }).error(( err ) => {
         return cb(err);
      });
   });

   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({ extended: false }));
   app.use(cookieParser());
   app.use(expressSession({
      secret: config.get('sessionSecret'),
      resave: false,
      saveUninitialized: false
   }));

   // Initialize Passport and restore authentication state, if any, from the session.
   app.use(passport.initialize());
   app.use(passport.session());

   app.use('/api', require('./routes/api'));
   app.use('/users', require('./routes/users'));

   app.all('/*', ( req, res ) => {
      res.status(404)
         .send('Not found');
   });

   // catch 404 and forward to error handler
   app.use(( req, res, next ) => {
      next({
         error: new Error('Not Found'),
         status: 404
      });
   });

   // error handler
   app.use(( err, req, res ) => {
      res.status(err.status || 500);
      logger.log('error', {
         message: err.message,
         error: err
      });
      res.json(responseFormatter(err));
   });

   const port = 3001;
   app.set('port', port);

   const server = http.createServer(app);

   server.on('error', (error) => {
      if (error.syscall !== 'listen') {
         throw error;
      }

      const bind = typeof port === 'string' ?
         'Pipe ' + port : 'Port ' + port;

      switch (error.code) {
         case 'EACCES':
            logger.error(bind + ' requires elevated privileges', { error: error });
            process.exit(1);
            break;
         case 'EADDRINUSE':
            logger.error(bind + ' is already in use', { error: error });
            process.exit(1);
            break;
         default:
            throw error;
      }
   });


   server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string' ?
         'pipe ' + addr : 'port ' + addr.port;
      debug('Listening on ' + bind);
   });

   server.listen(port);

   logger.info('Server started, listening to port: ' + port);
});
