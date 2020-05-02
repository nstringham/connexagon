// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.14.2/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: 'AIzaSyBwDm5gdkcV0Cqf9T1j4mw7vSaZ8fAJ4Jg',
    authDomain: 'nates-tic-tac-toe.firebaseapp.com',
    databaseURL: 'https://nates-tic-tac-toe.firebaseio.com',
    projectId: 'nates-tic-tac-toe',
    storageBucket: 'nates-tic-tac-toe.appspot.com',
    messagingSenderId: '38705155237',
    appId: '1:38705155237:web:b1b221005d75a6f29f914c',
    measurementId: 'G-YTWREEN91Y'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();