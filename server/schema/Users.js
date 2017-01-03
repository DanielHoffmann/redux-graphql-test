const Sequelize = require('sequelize');
const {
   GraphQLObjectType,
   GraphQLNonNull,
   GraphQLInt,
   GraphQLID,
   GraphQLString,
   GraphQLBoolean,
   GraphQLList
} = require('graphql');

module.exports = {
   sequelizeModel: (sequelize) => {
      return sequelize.define('Users', {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
         },
         email: {
            type: Sequelize.STRING,
            unique: true,
            allowNull: false
         },
         password_hash: {
            type: Sequelize.TEXT,
            allowNull: false
         },
         reset_token: {
            type: Sequelize.STRING,
         },
         token_expires: {
            type: Sequelize.DATE,
         },
         isAdmin: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
         }
      });
   },

   sequelizeAssociate(models) {

   },

   graphQLTypes: (db) => {
      return {
         User: new GraphQLObjectType({
            name: 'User',
            description: 'A user in the system',
            interfaces: [db.graphQLTypes.Node],
            fields: () => {
               return {
                  id: {
                     type: new GraphQLNonNull(GraphQLInt),
                     description: 'The database primary key of the user'
                  },
                  rid: {
                     type: new GraphQLNonNull(GraphQLID),
                     description: 'The relayId of the user',
                     resolve: (obj) => {
                        return 'User_' + obj.id
                     }
                  },
                  email: {
                     type: new GraphQLNonNull(GraphQLString),
                     description: 'The email of the user',
                  },
                  isAdmin: {
                     type: new GraphQLNonNull(GraphQLBoolean),
                     description: 'True if the user is an admin',
                  },
               };
            }
         })
      };
   },

   graphQLQueries: (db) => {
      return {
         users: {
            type: new GraphQLList(db.graphQLTypes.User),
            resolve: (context) => {
               return db.models.Users.findAll();
            }
         },
         user: {
            args: {
               id: {
                  type: new GraphQLNonNull(GraphQLInt),
               }
            },
            type: db.graphQLTypes.User,
            resolve: (context, {id}) => {
               return db.models.Users.findOne({
                  where: {
                     id: id
                  }
               });
            }
         }

         // /**
         //  * Create new user
         //  */
         // router.post('/',
         //    ensureLoggedIn('/'),
         //    ( req, res ) => {
         //       let userData = req.body.data;
         //       let emailValidationReg =
         //          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // jshint ignore:line
         //       if ( !emailValidationReg.test(userData.email) ) {
         //          res.json(responseFormatter(new Error('Invalid email address')));
         //          return;
         //       }
         //       userData.isAdmin = false;
         //       userData.password_hash = crypto.randomBytes(64);
         //       return Users.create(userData, {})
         //          .then(( user ) => {
         //             generateToken(user.email, true, res);
         //             res.json(responseFormatter());
         //          })
         //          .catch(( err ) => res.json(responseFormatter(err)) );
         //    });
         //
         // /**
         //  * Delete user
         //  */
         // router.delete('/:id',
         //    ensureLoggedIn('/'),
         //    ( req, res ) => {
         //       let id = req.params.id;
         //       return Users.find({ where: { id: id, isAdmin: false } })
         //          .then(( user ) => {
         //             return user.destroy();
         //          })
         //          .then(() => res.json(responseFormatter()) )
         //          .catch(( err ) => res.json(responseFormatter(err)) );
         //    });
      };
   },

   graphQLMutations: (db) => {
      return {};
   }
}
