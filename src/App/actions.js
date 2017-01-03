import types from './actionTypes';
import net from '../util/networking';

const self = {
   setCurrentUser: (user) => {
      return {
         type: types.SET_CURRENT_USER,
         user
      }
   },

   login: (username, password) => {
      return (dispatch) => {
         net.post('/users/login', { username, password})
            .then((res) => {
               dispatch(self.setCurrentUser(res.data.user));
            });
      }
   },

   logout: () => {
      return (dispatch) => {
         net.post('/users/logout')
            .then((res) => {
               dispatch(self.setCurrentUser(null));
            });
      }
   },
};


export default self;
