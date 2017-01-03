import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite/no-important';
import { TextField, RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import theme from '../theme';
import actions from './actions';

const styles = StyleSheet.create({
   container: {
      display: 'flex',
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
   },
   form: {
      display: 'flex',
      width: 400,
      flexDirection: 'column',
      backgroundColor: theme.palette.canvasColor,
      margin: 15,
      padding: 15,
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
   }
});

class LoginForm extends Component {
   constructor(props) {
      super(props);
      this.login = this.login.bind(this);
   }

   login(ev) {
      this.props.login(this.emailField.getValue(), this.passwordField.getValue());
      ev.preventDefault();
   }

   render() {
      return (
         <div className={css(styles.container)}>
            <form
               className={css(styles.form)}
               onSubmit={this.login}
               action='/'
            >
               <TextField
                  name='username'
                  ref={(field) => this.emailField = field }
                  floatingLabelText='Email'
               />
               <TextField
                  name='password'
                  ref={(field) =>
                     this.passwordField = field
                  }
                  floatingLabelText='Password'
                  type='password'
               />
               <RaisedButton
                  type='submit'
                  label='Login'
                  primary={true}
               />
            </form>
         </div>
      );
   }
}


function mapStateToProps(state) {
   return {};
}

function mapDispatchToProps(dispatch) {
   return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
