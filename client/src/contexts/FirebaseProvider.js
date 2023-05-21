import {
    getAuth,
    GoogleAuthProvider, signInWithPopup,
} from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyA6KNM_WBmpX5Jq9FqzgVJO6KiArXifS_4",
    authDomain: "chatapp-f722f.firebaseapp.com",
    projectId: "chatapp-f722f",
    storageBucket: "chatapp-f722f.appspot.com",
    messagingSenderId: "348189912931",
    appId: "1:348189912931:web:b6aa699bb65e15a340ad56",
    measurementId: "G-M9X3G0J8NL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(app);

const signinwithGoogle = (e) => {
    return new Promise((resolve, reject) => {
        signInWithPopup(auth, provider)
            .then(async (result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                const user = result.user;
                resolve(user)
            })

            .catch((error) => {
                reject(error);
            });
    });
};

export default signinwithGoogle
