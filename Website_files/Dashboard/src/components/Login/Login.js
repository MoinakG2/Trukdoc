import React from 'react';
import { firebase, auth } from '../../firebase';
import { StyledFirebaseAuth } from 'react-firebaseui';

const Login = () => {
  const uiConfig = {
    signInFlow: 'popup',
    signInSuccessUrl: '/dashboard',
    signInOptions: [
      {
        provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
        recaptchaParameters: {
          size: 'invisible',
        },
        defaultCountry: 'IN',
      },
    ],
  };
  return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={auth} />;
};

export default Login;
