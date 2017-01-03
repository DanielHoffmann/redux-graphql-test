const express = require('express');
const router = express.Router();
const passport = require('passport');
const bodyParser = require('body-parser');
const colorOut = require('../util/colorOut.js');
const tracer = require('tracer');
const logger = tracer.console(colorOut());
const db = require('../schema/index');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const responseFormatter = require('../util/responseFormatter');
// const email = require('../api/email');

const Users = db.models.Users;

// Bypass ensuredLogged in for dev
const bypass = () => {
   return ( req, res, next ) => {
      next();
   };
};
const ensureLoggedIn = ( process.env.NODE_ENV === 'development' ) ? bypass : require('connect-ensure-login').ensureLoggedIn;


router.use(bodyParser.json());


/**
 * Generates and send reset password tokens
 * @param userEmail string email of user
 * @param newUser bool
 * @param res object
 */
const generateToken = ( userEmail, newUser, res ) => {
   let token, user;
   // Generate randome token
   return new Promise(( resolve, reject ) => {
      crypto.randomBytes(20, ( err, buf ) => {
         if ( err ) {
            reject(err);
         }
         let token = buf.toString('hex');
         resolve(token);
      });
   })
      .then(( _token ) => {
         token = _token;
         return Users.find({
            where: {
               email: {
                  $iLike: userEmail
               }
            }
         });
      })
      .then(( _user ) => {
         user = _user;
         if ( !user ) {
            throw new Error(userEmail + ' not found');
         }
         return user.update({
            reset_token: token,
            token_expires: Date.now() + 3600000 // 1 hour
         });
      })
      .then(( user ) => {
         if ( newUser ) {
            // TODO
            // email.userCreated(user.email, token);
         } else {
            // email.resetPassword(user.email, token);
         }
         res.json(responseFormatter());
      })
      .catch(( err ) => res.json(responseFormatter(err)) );
};

/* POST login */
router.post('/login', (req, res, next) => {
   passport.authenticate('local', (err, user, info) => {
      if (err) {
         next(err);
      } else if (!user) {
         res.status(403);
         res.json(responseFormatter(new Error('Wrong user name or password')));
      } else {
         req.logIn(user, function(err) {
            if (err) {
               next(err);
            } else {
               db.query(`{
                  user(id: ${user.id}) {
                     id,
                     email,
                     isAdmin
                  }
               }`).then((response) => {
                  return res.json(response);
               });
            }
         });
      }
   })(req, res, next);
});

/* GET current user */
router.get('/current-user', ( req, res ) => {
   //Skip auth on developemnt env
   if ( process.env.NODE_ENV === 'development' ) {
      res.json(responseFormatter({
         data: {
            user: {
               id: -1,
               email: 'admin@noauth.dev',
               isAdmin: true
            }
         }
      }));
   } else {
      if (req.user) {
         db.query(`{
            user(id: ${req.user.id}) {
               id,
               email,
               isAdmin
            }
         }`).then((data) => res.json(data) );
      } else {
         res.json({
            data: {
               user: null
            }
         });
      }
   }
});

/*Logout */
router.route('/logout')
   .all(( req, res ) => {
      req.logOut();
      req.session.destroy();
      res.json(responseFormatter())
   });

/**
 * Generate and send reset password token
 */
router.post('/forgot', ( req, res ) => {
   let userEmail = req.body.email;
   generateToken(userEmail, false, res);
});

router.post('/reset', ( req, res ) => {
   let token = req.body.token;
   let pass = req.body.pass;
   logger.warn(req.body.token, req.body.pass);
   return Users.find({
      where: {
         reset_token: token,
         token_expires: {
            $gt: new Date()
         }
      }
   }).then(( user ) => {
      if ( !user ) {
         throw new Error('Password reset token is invalid or has expired.');
      }
      return bcrypt.genSalt(10, ( err, salt ) => {
         return bcrypt.hash(pass, salt, ( err, hash ) => {
            if ( err ) {
               logger.error('Error while hashing password: %j', { error: err });
               throw new Error('Error while hashing password');
            } else {
               user.update({ password_hash: hash, reset_token: null, token_expires: null });
            }
         });
      });
   })
   .then(() => res.json(responseFormatter()) )
   .catch(( err ) => res.json(responseFormatter(err)) );
});


module.exports = router;
