<script setup>
    import LoginRegisterBar from "@/components/LoginRegisterBar.vue";
    import { useTestingStore } from "@/stores/testingStore";
    import { ArrowRight, AtSign, KeyRound } from "@lucide/vue";
    import { ref } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();
    const testingStore = useTestingStore();

    const valid_creds = ref(true);
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

    function logIn() {
        valid_creds.value = testingStore.logUser(email.value, password.value);

        if (valid_creds.value) router.push("/");
    }
</script>

<template>
    <div class="bg-mm-dark h-screen flex flex-col items-center px-8">
        <div class="pt-10 pb-20 text-[72px] font-extrabold">
            <span class="text-mm-white">BIZ</span>
            <span class="text-mm-primary">MON</span>
        </div>

        <div
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
                <span v-if="!valid_creds" class="absolute top-1 text-mm-error"
                    >Neispravno korisničko ime ili lozinka!</span
                >
                <hr class="border-mm-gray w-full" />
            </div>
            <button
                class="bg-mm-primary text-mm-dark text-lg font-extrabold flex gap-4 items-center w-fit mx-auto py-1.5 px-10 rounded-full"
                :disabled="!(email && password)"
                @click="logIn()"
            >
                <span>PRIJAVA</span>
                <ArrowRight />
            </button>
        </div>

        <LoginRegisterBar class="fixed bottom-0 w-full" />
    </div>
</template>
