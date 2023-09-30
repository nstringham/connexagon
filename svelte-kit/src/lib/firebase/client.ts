import { browser } from '$app/environment';
import {
	PUBLIC_FIREBASE_API_KEY,
	PUBLIC_FIREBASE_AUTH_DOMAIN,
	PUBLIC_FIREBASE_DATABASE_URL,
	PUBLIC_FIREBASE_PROJECT_ID,
	PUBLIC_FIREBASE_STORAGE_BUCKET,
	PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	PUBLIC_FIREBASE_APP_ID
} from '$env/static/public';
import { initializeApp } from 'firebase/app';
import {
	browserPopupRedirectResolver,
	browserSessionPersistence,
	debugErrorMap,
	initializeAuth,
	prodErrorMap
} from 'firebase/auth';
import { CollectionReference, collection, initializeFirestore } from 'firebase/firestore';
import type { Game } from './firestore';

export {
	GoogleAuthProvider,
	TwitterAuthProvider,
	signInWithPopup,
	signInAnonymously,
	signOut
} from 'firebase/auth';
export { doc, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

if (!browser) {
	throw new Error('client is a browser only module');
}

const app = initializeApp({
	apiKey: PUBLIC_FIREBASE_API_KEY,
	authDomain: PUBLIC_FIREBASE_AUTH_DOMAIN,
	databaseURL: PUBLIC_FIREBASE_DATABASE_URL,
	projectId: PUBLIC_FIREBASE_PROJECT_ID,
	storageBucket: PUBLIC_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
	appId: PUBLIC_FIREBASE_APP_ID
});

export const auth = initializeAuth(app, {
	errorMap: import.meta.env.DEV ? debugErrorMap : prodErrorMap,
	persistence: browserSessionPersistence,
	popupRedirectResolver: browserPopupRedirectResolver
});

const db = initializeFirestore(app, {});

export const gamesCollection = collection(db, 'games') as CollectionReference<Game>;
