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

async function createDocument(collName, data) {
    data["ownerId"] = loggedUser.value.uid;
    await addDoc(collection(db, collName), data);
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

    return data.exists()
        ? data.docs.map((d) => Object.assign(d.data(), { id: d.id }))
        : null;
}

async function updateDocument(collName, data, docId) {
    await updateDoc(doc(db, collName, docId), data);
}

async function deleteDocument(collName, docId) {
    await deleteDoc(doc(db, collName, docId));
}

export {
    auth,
    db,
    loggedUser,
    readCollection,
    createDocument,
    updateDocument,
    deleteDocument,
};
