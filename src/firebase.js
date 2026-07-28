import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { ref } from "vue";

const firebaseConfig = {
    apiKey: "AIzaSyDY5lbNITSD3VjyE23CBrOhBjLmY-vgF5o",
    authDomain: "bizmon-18i35.firebaseapp.com",
    projectId: "bizmon-18i35",
    storageBucket: "bizmon-18i35.firebasestorage.app",
    messagingSenderId: "1075416766200",
    appId: "1:1075416766200:web:5b00df4b7cae7f22460d0d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const loggedUser = ref(null);

onAuthStateChanged(auth, (user) => {
    if (user) {
        loggedUser.value = user;
    } else {
        loggedUser.value = null;
    }
});

export { auth, db, loggedUser };
