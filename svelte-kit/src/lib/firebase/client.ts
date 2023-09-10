import { browser } from '$app/environment';
import { initializeApp } from 'firebase/app';
import {
	browserPopupRedirectResolver,
	browserSessionPersistence,
	debugErrorMap,
	initializeAuth
} from 'firebase/auth';
export {
	GoogleAuthProvider,
	TwitterAuthProvider,
	signInWithPopup,
	signInAnonymously,
	signOut
} from 'firebase/auth';

if (!browser) {
	throw new Error('client browser only module');
}

const firebaseConfig = {
	apiKey: 'AIzaSyBgo8L34F8JgmTIs-9cFvV3UA5PdvY1F9w',
	authDomain: 'connexagon.firebaseapp.com',
	databaseURL: 'https://connexagon.firebaseio.com',
	projectId: 'connexagon',
	storageBucket: 'connexagon.appspot.com',
	messagingSenderId: '1096351441958',
	appId: '1:1096351441958:web:0c08600c5b6b65f15bb2e7'
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
	errorMap: debugErrorMap,
	persistence: browserSessionPersistence,
	popupRedirectResolver: browserPopupRedirectResolver
});
