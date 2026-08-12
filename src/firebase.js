import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { ref } from "vue";
import firebaseError from "./data/errorsData";

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
const userData = ref(null);

onAuthStateChanged(auth, async (user) => {
    loggedUser.value = user;

    try {
        userData.value = user ? await readDocument("users", user.uid) : null;
    } catch (error) {
        alert(firebaseError(error.code));
    }
});

async function createDocument(collName, data) {
    data["ownerId"] = loggedUser.value.uid;
    return await addDoc(collection(db, collName), data);
}

async function readCollection(name, sortBy, dir) {
    const data = await getDocs(
        query(
            collection(db, name),
            where("ownerId", "==", loggedUser.value.uid),
            orderBy(sortBy, dir),
        ),
    );

    return data.docs.map((d) => Object.assign(d.data(), { id: d.id }));
}

async function readDocument(collName, docId) {
    const data = await getDoc(doc(db, collName, docId));

    return data.exists() ? Object.assign(data.data(), { id: data.id }) : null;
}

async function updateDocument(collName, data, docId) {
    return await updateDoc(doc(db, collName, docId), data);
}

async function deleteDocument(collName, docId) {
    return await deleteDoc(doc(db, collName, docId));
}

export {
    auth,
    db,
    loggedUser,
    userData,
    createDocument,
    readCollection,
    readDocument,
    updateDocument,
    deleteDocument,
};
