<script setup>
    import LoginRegisterBar from "@/components/LoginRegisterBar.vue";
    import firebaseError from "@/data/errorsData";
    import { auth } from "@/firebase";
    import { ArrowRight, AtSign, KeyRound } from "@lucide/vue";
    import { signInWithEmailAndPassword } from "firebase/auth";
    import { ref } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const loginErr = ref("");
    const email = ref("");
    const password = ref("");

    const loginData = [
        {
            label: "E-MAIL:",
            icon: AtSign,
            type: "email",
            placeholder: "npr. test.mail@domain.org",
            data: email,
        },
        {
            label: "LOZINKA:",
            icon: KeyRound,
            type: "password",
            placeholder: "• • • • • • • •",
            data: password,
        },
    ];

    async function logIn() {
        loginErr.value = "";
        try {
            await signInWithEmailAndPassword(auth, email.value, password.value);
        } catch (error) {
            loginErr.value = firebaseError(error.code);
        }

        if (!loginErr.value) router.push("/");
    }
</script>

<template>
    <div class="bg-mm-dark h-screen flex flex-col items-center px-8">
        <div class="pt-10 pb-20 text-[72px] font-extrabold">
            <span class="text-mm-white">BIZ</span>
            <span class="text-mm-primary">MON</span>
        </div>

        <
        <form
            @submit.prevent="logIn()"
            class="bg-mm-lightnavy p-6 pb-8 rounded-3xl w-full flex flex-col gap-8"
        >
            <div v-for="item in loginData" class="input-block">
                <span class="input-label">{{ item.label }}</span>
                <div class="input-field">
                    <component :is="item.icon" size="30" />
                    <input
                        :class="{ 'text-mm-white': item.data.value }"
                        :type="item.type"
                        :placeholder="item.placeholder"
                        class="w-full"
                        v-model="item.data.value"
                    />
                </div>
            </div>
            <div class="relative flex flex-col items-center">
                <span v-if="loginErr" class="absolute top-1 text-mm-error">{{
                    loginErr
                }}</span>
                <hr class="border-mm-gray w-full" />
            </div>
            <button
                class="bg-mm-primary text-mm-dark text-lg font-extrabold flex gap-4 items-center w-fit mx-auto py-1.5 px-10 rounded-full"
                :disabled="!(email && password)"
                type="submit"
            >
                <span>PRIJAVA</span>
                <ArrowRight />
            </button>
        </form>

        <LoginRegisterBar class="fixed bottom-0 w-full" />
    </div>
</template>
