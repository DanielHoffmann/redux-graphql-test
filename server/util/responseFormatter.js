const extend = require('util')._extend;

module.exports = (message) => {
   if (message == null) {
      return {
         errors: null,
      };
   }

   if (message instanceof Error) {
      return {
         errors: [
            {
               message: message.message,
               stack: process.env.NODE_ENV === 'development' ? message.stack : '',
               locations: []
            }
         ]
      };
   }

   // testing for plain object
   if (typeof message === 'object' && message.constructor === Object) {
      return extend({ errors: null }, message);
   }

   return {
      errors: null,
      message
   }
};
