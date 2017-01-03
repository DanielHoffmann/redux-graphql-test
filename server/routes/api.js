const express = require('express');
const router = express.Router();
const { ensureLoggedIn } = require('connect-ensure-login');
const db = require('../schema/index');
const graphqlHTTP = require('express-graphql');

const gqlOptions = {
   schema: db.schema
};

//Skip auth on developemnt env
if (process.env.NODE_ENV === 'development') {
   gqlOptions.graphiql = true;
   gqlOptions.pretty = true;
} else {
   router.all('*', ensureLoggedIn('/users/login_fail'));
}

router.use('/', graphqlHTTP(gqlOptions));

module.exports = router;
