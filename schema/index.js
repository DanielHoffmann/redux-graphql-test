const Sequelize = require('sequelize');
const config = require('config');
const { _extend } = require('util');
const {
   graphql,
   GraphQLSchema,
   GraphQLObjectType,
   GraphQLNonNull,
   GraphQLInterfaceType,
   GraphQLID
} = require('graphql');
const logger = require('../util/logger');

const schemas = {
   Users: require('./users')
};

const dbHost = config.get('db.host'),
   dbName = config.get('db.name'),
   dbUser = config.get('db.user'),
   dbPass = config.get('db.pass');

const db = {
   models: {},
   schema: null,
   query: null,
   graphQLTypes: {
      Node: new GraphQLInterfaceType({
         name: 'Node',
         fields: {
            rid: {
               type: new GraphQLNonNull(GraphQLID),
               description: 'Unique id among all entities in the Schema, used for Relay compatibility',
               resolve: (...args) => {
                  console.log(args);
               }
            }
         },
         resolveType: () => {
            return db.graphQLTypes.User;
         }
      })
   },
   graphQLQueries: {},
   graphQLMutations: {},
   sequelize: new Sequelize(dbName, dbUser, dbPass, {
      host: dbHost,
      dialect: 'postgres',
      maxConcurrentQueries: 50,
      pool: {
         maxConnections: 20,
         minConnections: 1,
         maxIdleTime: 90
      },
      logging: logger.debug
   })
};

const schemaKeys = Object.keys(schemas);

// initializing sequelize models
schemaKeys.forEach((name) => {
   db.models[name] = schemas[name].sequelizeModel(db.sequelize);
});

// creating sequelize associations
schemaKeys.forEach((name) => {
   schemas[name].sequelizeAssociate(db.models);
});

// initializing graphQL types
schemaKeys.forEach((name) => {
   db.graphQLTypes = _extend(db.graphQLTypes, schemas[name].graphQLTypes(db));
});

// getting graphQL queries
schemaKeys.forEach((name) => {
   db.graphQLQueries = _extend(db.graphQLQueries, schemas[name].graphQLQueries(db));
});

// getting graphQL mutations
schemaKeys.forEach((name) => {
   db.graphQLMutations = _extend(db.graphQLMutations, schemas[name].graphQLMutations(db));
});

db.schema = new GraphQLSchema({
   query: new GraphQLObjectType({
      name: 'RootQueryType',
      fields: db.graphQLQueries
   }),

   // mutation: new GraphQLObjectType({
   //    name: 'Mutations',
   //    fields: db.graphQLMutations
   // })
});

db.query = (query) => {
   return graphql(db.schema, query);
};

module.exports = db;
