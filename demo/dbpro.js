"use strict";

// firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyB9ha_be5t93vgk2x9XhCv-nD8MoBvalv0",
  authDomain: "tota-nails.firebaseapp.com",
  projectId: "tota-nails",
  storageBucket: "tota-nails.appspot.com",
  messagingSenderId: "767505157793",
  appId: "1:767505157793:web:3c96db2f668ff3f7d7aae0",
  measurementId: "G-Y3DNRQJFZP",
};

// Initialize Firebase
let app = firebase.initializeApp(firebaseConfig);
let db = firebase.database();
console.log("🔥 Firebase app:", app.name);