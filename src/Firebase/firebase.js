
import { deleteApp, initializeApp } from "firebase/app";
import {getAuth} from  "firebase/auth"
import {getFirestore} from "firebase/firestore"
import {getStorage} from 'firebase/storage'
const firebaseConfig = {

  apiKey: "AIzaSyACGwPprpYSisp72b4WY6x1gAuK8-g3Xdo",
  authDomain: "react-chat-app-c2625.firebaseapp.com",
  databaseURL: "https://react-chat-app-c2625-default-rtdb.firebaseio.com",
  projectId: "react-chat-app-c2625",
  storageBucket: "react-chat-app-c2625.firebasestorage.app",
  messagingSenderId: "29653929509",
  appId: "1:29653929509:web:82fbdd5aaa8bf6eb7bf9cc"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app)

export default app;


