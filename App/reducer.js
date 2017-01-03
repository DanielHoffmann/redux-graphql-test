import types from './actionTypes';

export default function login(state = {
   loggedIn: null, // if null we are currently checking if the user is loggedIn
   user: null,
}, action) {
   switch (action.type) {
      case types.SET_CURRENT_USER:
         return {
            ...state,
            loggedIn: action.user !== null,
            user: action.user,
         };
      default:
         return state;
   }
}
