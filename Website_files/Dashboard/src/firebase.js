import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCdU9iPl-eYlAoSO_MBgqQuLG5FFxf4Jp8',
  authDomain: 'interiit-silabs-343212.firebaseapp.com',
  projectId: 'interiit-silabs-343212',
  storageBucket: 'interiit-silabs-343212.appspot.com',
  messagingSenderId: '800426981034',
  appId: '1:800426981034:web:e35fb6cfaf5716529ec2d3',
  measurementId: 'G-G5DFXVJCTY',
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
auth.languageCode = 'it';
const db = firebase.firestore();
export { auth, firebase, db };
