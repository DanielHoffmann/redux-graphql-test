import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { RaisedButton, AppBar } from 'material-ui';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { StyleSheet, css } from 'aphrodite/no-important';
import CircularProgress from 'material-ui/CircularProgress';
import { Provider, connect } from 'react-redux';
import LoginForm from './LoginForm';
import theme from '../theme';
import store from '../store';
import actions from './actions';

class Main extends Component {
   render() {
      if (this.props.loggedIn === null) {
         return (
            <CircularProgress />
         )
      } else if (this.props.loggedIn === false) {
         return (
            <LoginForm />
         )
      } else {
         return (
            <RaisedButton onClick={this.props.logout} label="Default" />
         )
      }
   }
}

function mapStateToProps(state) {
   return {
      loggedIn: state.appReducer.loggedIn,
   };
}

const mapDispatchToProps = {
   logout: actions.logout
};

Main = connect(mapStateToProps, mapDispatchToProps)(Main);


const styles = StyleSheet.create({
   container: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
   }
});

class App extends Component {
  render() {
      return (
         <Provider store={store}>
            <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
               <div className={css(styles.container)}>
                  <AppBar
                     title="Players Specials CMS"
                  />
                  <Main />
               </div>
            </MuiThemeProvider>
         </Provider>
      )
  }
}

export default App;
