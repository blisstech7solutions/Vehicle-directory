const firebaseConfig = {
  apiKey: "AIzaSyCXI2x8zTAif10p4Axz6y63tDguc3z-kwI",
  authDomain: "nakshatrailandewing-e59fb.firebaseapp.com",
  projectId: "nakshatrailandewing-e59fb",
  storageBucket: "nakshatrailandewing-e59fb.appspot.com",
  messagingSenderId: "1030636700114",
  appId: "1:1030636700114:web:051b019a4ec903d39f880b",
  measurementId: "G-HV1V5L3127"
};

let auth = null;
let db = null;
let firebaseInitError = null;

try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
  window.firebaseInitStatus = "ready";
} catch (error) {
  firebaseInitError = error;
  window.firebaseInitStatus = "error";
  window.firebaseInitError = error;
}

window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseInitError = firebaseInitError;
