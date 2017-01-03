import React from 'react';
import ReactDOM from 'react-dom';
import App from './App/App';
import injectTapEventPlugin from 'react-tap-event-plugin';
import './index.css';
import theme from './theme';
import networking from './util/networking';
import store from './store';
import actions from './App/actions';

injectTapEventPlugin(); // material-ui depends on this, but they are planning on removing this dependency

document.documentElement.style.backgroundColor = theme.palette.accent2Color;

networking.get('users/current-user').then((res) => {
   store.dispatch(actions.setCurrentUser(res.data.user));
});

ReactDOM.render(
   <App />,
   document.getElementById('root')
);
