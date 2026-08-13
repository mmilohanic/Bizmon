<script setup>
    import GoogleButton from "@/components/GoogleButton.vue";
    import LoginRegisterBar from "@/components/LoginRegisterBar.vue";
    import firebaseError from "@/data/errorsData";
    import { auth, db } from "@/firebase";
    import { ArrowRight, AtSign, KeyRound } from "@lucide/vue";
    import {
        GoogleAuthProvider,
        signInWithEmailAndPassword,
        signInWithPopup,
    } from "firebase/auth";
    import {
        doc,
        getDoc,
        serverTimestamp,
        setDoc,
        updateDoc,
    } from "firebase/firestore";
    import { ref } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const loginErr = ref(null);
    const email = ref("");
    const password = ref("");

    const loginData = [
        {
            label: "E-MAIL:",
            icon: AtSign,
            type: "email",
            inputmode: "email",
            placeholder: "npr. test.mail@domain.org",
            data: email,
        },
        {
            label: "LOZINKA:",
            icon: KeyRound,
            type: "password",
            inputmode: "text",
            placeholder: "• • • • • • • •",
            data: password,
        },
    ];

    async function logIn() {
        loginErr.value = null;
        try {
            await signInWithEmailAndPassword(auth, email.value, password.value);
            router.push("/");
        } catch (error) {
            loginErr.value = firebaseError(error.code);
        }
    }

    async function signInWithGoogle() {
        loginErr.value = null;
        try {
            const response = await signInWithPopup(
                auth,
                new GoogleAuthProvider(),
            );
            const user = response.user;
            const dbUser = doc(db, "users", user.uid);

            if (!(await getDoc(dbUser)).exists()) {
                await setDoc(dbUser, {
                    username: user.displayName,
                    email: user.email,
                    registered_on: serverTimestamp(),
                    collabs_count: 0,
                    active: true,
                });
            }

            if (user.displayName != (await getDoc(dbUser)).data().username) {
                await updateDoc(dbUser, {
                    username: auth.currentUser.displayName,
                });
            }

            router.push("/");
        } catch (error) {
            if (
                ![
                    "auth/popup-closed-by-user",
                    "auth/cancelled-popup-request",
                ].includes(error.code)
            ) {
                console.log(error);
                loginErr.value = firebaseError(error.code);
            }
        }
    }
</script>

<template>
    <div class="h-full flex flex-col justify-between bg-mm-dark">
        <div class="flex flex-col items-center px-8 pb-8 overflow-y-auto">
            <div class="pt-10 pb-22 text-7xl font-extrabold">
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </div>

            <form
                @submit.prevent="logIn()"
                class="bg-mm-lightnavy p-6 pb-8 rounded-3xl w-full flex flex-col gap-8"
            >
                <div v-for="item in loginData" class="main-container">
                    <span class="log-reg-label">{{ item.label }}</span>
                    <div class="log-reg-field">
                        <component :is="item.icon" size="30" />
                        <input
                            :class="{ 'text-mm-white': item.data.value }"
                            :type="item.type"
                            :inputmode="item.inputmode"
                            :placeholder="item.placeholder"
                            class="w-full px-1"
                            v-model="item.data.value"
                        />
                    </div>
                </div>
                <div class="relative flex flex-col items-center">
                    <span
                        v-if="loginErr"
                        class="absolute top-1 text-mm-error"
                        >{{ loginErr }}</span
                    >
                    <hr class="border-mm-gray w-full" />
                </div>
                <div class="flex flex-col gap-6 max-w-50 mx-auto">
                    <button
                        class="confirm-btn flex gap-3 place-items-center text-lg"
                        :disabled="!(email && password)"
                        type="submit"
                    >
                        <span>PRIJAVA</span>
                        <ArrowRight />
                    </button>
                    <GoogleButton @click="signInWithGoogle()" />
                </div>
            </form>
        </div>

        <LoginRegisterBar />
    </div>
</template>
