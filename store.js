import { createStore, combineReducers, applyMiddleware } from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import appReducer from './App/reducer';

const initialState = {};

const store = createStore(
   combineReducers({
      appReducer
   }),
   initialState,
   applyMiddleware(
      thunk,
      createLogger()
   ));


export default store;
