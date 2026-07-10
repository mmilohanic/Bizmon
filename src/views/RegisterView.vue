<script setup>
    import LoginRegisterBar from "@/components/LoginRegisterBar.vue";
    import { useTestingStore } from "@/stores/testingStore";
    import { AtSign, IdCard, KeyRound, Repeat2 } from "@lucide/vue";
    import { ref, computed } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const username = ref("");
    const email = ref("");
    const password = ref("");
    const repeated = ref("");

    const checkUsername = computed(() => {
        if (username.value.length < 3)
            return "Ime i prezime mora imati barem tri znaka!";
        else if (username.value.length > 100)
            return "Ime i prezime mora biti kraće od 100 znakova!";
    });

    const checkEmail = computed(() => {
        if (!email.value.includes("@"))
            return "Email mora sadržavati znak '@'!";
        else if (email.value.indexOf("@") == 0)
            return "Email nema korisnički dio (prije '@')!";
        else if (email.value.indexOf("@") == email.value.length - 1)
            return "Email nema domenski dio (nakon '@')!";
        else if (!email.value.slice(email.value.indexOf("@") + 1).includes("."))
            return "Email mora sadržavati točku u domeni!";
        else if (email.value.indexOf(".") == email.value.length - 1)
            return "Email domena je nepotpuna!";
        else if (email.value.length > 100)
            return "Email mora biti kraći od 100 znakova!";
    });

    const checkPassword = computed(() => {
        if (password.value.length < 8)
            return "Lozinka mora imati barem 8 znakova!";
        else if (!/\d/.test(password.value))
            return "Lozinka mora sadržavati broj!";
        else if (!/[A-Z]/.test(password.value))
            return "Lozinka mora sadržavati veliko slovo";
        else if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'~`]/.test(password.value))
            return "Lozinka mora sadržavati poseban znak!";
        else if (password.value.length > 100)
            return "Lozinka mora biti kraća od 100 znakova!";
    });

    const checkRepetedPass = computed(() => {
        if (password.value != repeated.value)
            return "Ponovljena lozinka nije jednaka originalnoj!";
    });

    const loginData = [
        {
            label: "IME I PREZIME:",
            icon: IdCard,
            type: "text",
            placeholder: "npr. Pero Perić",
            data: username,
            rules: checkUsername,
            visited: ref(false),
        },
        {
            label: "E-MAIL:",
            icon: AtSign,
            type: "email",
            placeholder: "npr. test.mail@domain.org",
            data: email,
            rules: checkEmail,
            visited: ref(false),
        },
        {
            label: "LOZINKA:",
            icon: KeyRound,
            type: "password",
            placeholder: "• • • • • • • •",
            data: password,
            rules: checkPassword,
            visited: ref(false),
        },
        {
            label: "PONOVI LOZINKU:",
            icon: Repeat2,
            type: "password",
            placeholder: "• • • • • • • •",
            data: repeated,
            rules: checkRepetedPass,
            visited: ref(true),
        },
    ];

    const allValid = computed(() =>
        loginData.map((item) => item.rules).every((rule) => !rule.value),
    );

    function registerUser() {
        if (allValid.value) {
            useTestingStore().addUser(
                username.value,
                email.value,
                password.value,
            );

            username.value = "";
            email.value = "";
            password.value = "";
            repeated.value = "";

            router.push("/login");
        }
    }
</script>

<template>
    <div class="bg-mm-dark h-screen flex flex-col items-center px-8">
        <div class="py-10 text-[72px] font-extrabold">
            <span class="text-mm-white">BIZ</span>
            <span class="text-mm-primary">MON</span>
        </div>

        <div
            class="bg-mm-lightnavy p-6 pb-8 rounded-3xl w-full flex flex-col gap-8"
        >
            <div v-for="item in loginData" class="input-block">
                <div
                    v-if="item.label.includes('LOZINKA')"
                    class="flex justify-between items-center"
                >
                    <span class="input-label">{{ item.label }}</span>
                    <span class="text-mm-gray text-sm">min. 8 znakova</span>
                </div>
                <span v-else class="input-label">{{ item.label }}</span>
                <div class="input-field relative">
                    <component :is="item.icon" size="30" />
                    <input
                        :class="{ 'text-mm-white': item.data.value }"
                        :type="item.type"
                        :placeholder="item.placeholder"
                        class="w-full"
                        v-model="item.data.value"
                        @blur="item.visited.value = Boolean(item.data.value)"
                    />
                    <span
                        v-if="item.data.value && item.visited.value"
                        class="absolute top-12 text-mm-error text-sm"
                        >{{ item.rules }}</span
                    >
                </div>
            </div>
            <button
                :disabled="!allValid"
                @click="registerUser()"
                class="bg-mm-primary text-mm-dark disabled:bg-mm-gray text-lg font-extrabold flex items-center w-fit mx-auto py-2 px-8 rounded-full"
            >
                REGISTRIRAJ SE
            </button>
        </div>

        <LoginRegisterBar class="fixed bottom-0 w-full" />
    </div>
</template>
