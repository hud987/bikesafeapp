import * as firebase from 'firebase';
import firestore from 'firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyAQ6JZnM-5sMY9Za63OUKE2fNvRQy_h9CY",
    authDomain: "bike-safety-1579109044880.firebaseapp.com",
    databaseURL: "https://bike-safety-1579109044880.firebaseio.com",
    projectId: "bike-safety-1579109044880",
    storageBucket: "bike-safety-1579109044880.appspot.com",
    messagingSenderId: "000000000000001",
    appId: "1:302952989263:ios:a9759b16bd60489aba603a"
};

firebase.initializeApp(firebaseConfig);

firebase.firestore();

export default firebase;