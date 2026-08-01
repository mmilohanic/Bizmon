<script setup>
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import doctypesData from "@/data/doctypesData";
    import firebaseError from "@/data/errorsData";
    import { auth, db, loggedUser } from "@/firebase";
    import {
        ChartNoAxesCombined,
        ChevronDown,
        CreditCard,
        Eye,
        EyeOff,
        SaveCheck,
        X,
    } from "@lucide/vue";
    import {
        deleteUser,
        EmailAuthProvider,
        GoogleAuthProvider,
        reauthenticateWithCredential,
        reauthenticateWithPopup,
        updatePassword,
    } from "firebase/auth";
    import { doc, updateDoc } from "firebase/firestore";
    import { computed, ref } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const activeModal = ref(null);
    const password = ref("");
    const viewPass = ref(false);
    const errMsg = ref(null);
    const oldPass = ref("");
    const oldPassOK = ref(false);
    const normalLogin =
        loggedUser.value.providerData[0].providerId === "password";

    defineEmits(["openInfo"]);

    const options = [
        "ovaj mjesec",
        "zadnji mjesec",
        "3 mjeseca",
        "6 mjeseci",
        "jedna godina",
        "od početka",
    ];

    const billsTest = [
        {
            type: "Naplaćeno",
            amount: 7,
            total: 2568.34,
        },
        {
            type: "Otvoreno",
            amount: 5,
            total: 768.46,
        },
    ];

    const recentActivity = ref(false);
    const recentTest = [
        {
            name: "Klime zgrada Žminj",
            type: "Računi",
        },
        {
            name: "Sv. Lovreč - iskop Perić",
            type: "Ponude",
        },
        {
            name: "Elektroinstalacija Marić",
            type: "Narudžbe",
        },
    ];

    const selected = ref(options[0]);
    const open = ref(false);

    function select(option) {
        selected.value = option;
        open.value = false;
    }

    function chooseIcon(document) {
        return doctypesData.find((dtype) => dtype.label === document).icon;
    }

    function openModal(name) {
        errMsg.value = null;
        password.value = "";
        viewPass.value = false;
        oldPassOK.value = false;
        activeModal.value = name;
    }

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

    async function deleteAccount() {
        const user = auth.currentUser;
        errMsg.value = null;

        try {
            await reauthenticateWithCredential(
                user,
                EmailAuthProvider.credential(user.email, password.value),
            );

            await updateDoc(doc(db, "users", user.uid), {
                username: "Deleted user",
                email: "",
                active: false,
            });

            await deleteUser(user);
            router.push("/login");
        } catch (error) {
            if (
                ["auth/invalid-credential", "auth/wrong-password"].includes(
                    error.code,
                )
            ) {
                errMsg.value = "Pogrešna lozinka.";
            } else {
                errMsg.value = firebaseError(error.code);
            }
        }
    }

    async function changePassword() {
        const user = auth.currentUser;
        errMsg.value = null;

        if (!oldPassOK.value) {
            try {
                await reauthenticateWithCredential(
                    user,
                    EmailAuthProvider.credential(user.email, password.value),
                );

                oldPassOK.value = true;
                oldPass.value = password.value;
                password.value = "";
            } catch (error) {
                if (
                    ["auth/invalid-credential", "auth/wrong-password"].includes(
                        error.code,
                    )
                ) {
                    errMsg.value = "Pogrešna lozinka.";
                } else {
                    errMsg.value = firebaseError(error.code);
                }
            }
        } else if (password.value == oldPass.value) {
            errMsg.value = "Nova lozinka mora biti različita od stare.";
        } else {
            try {
                await updatePassword(user, password.value);
                openModal("succPassChange");
            } catch (error) {
                errMsg.value = firebaseError(error.code);
            }
        }
    }

    async function deleteGoogleAccount() {
        const user = auth.currentUser;
        errMsg.value = null;

        try {
            await reauthenticateWithPopup(user, new GoogleAuthProvider());

            await updateDoc(doc(db, "users", user.uid), {
                username: "Deleted user",
                email: "",
                active: false,
            });

            await deleteUser(user);
            router.push("/login");
        } catch (error) {
            if (
                ![
                    "auth/popup-closed-by-user",
                    "auth/cancelled-popup-request",
                ].includes(error.code)
            ) {
                errMsg.value = firebaseError(error.code);
            }
        }
    }
</script>

<template>
    <div class="bg-mm-dark h-screen">
        <DashboardHeader
            :info-active="activeModal === 'info'"
            @open-info="openModal('info')"
            class="fixed top-0 w-full z-10"
        />

        <div class="py-26 px-8 flex flex-col gap-4">
            <!-- Statistika -->
            <div class="dashboard-section">
                <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-start">
                        <ChartNoAxesCombined class="size-8 mt-0.5" />
                        <span class="text-[28px]">Statistika</span>
                    </div>

                    <!-- Filter dropdown -->
                    <div class="relative w-35">
                        <div
                            class="flex bg-mm-white text-black ps-2 pe-1 py-0.5 rounded justify-between"
                            :class="{ 'rounded-bl-none rounded-br-none': open }"
                            @click="open = !open"
                        >
                            <span>{{ selected }}</span>
                            <ChevronDown />
                        </div>

                        <ul
                            v-if="open"
                            class="absolute w-full bg-mm-white text-black rounded-bl rounded-br"
                        >
                            <li
                                v-for="(option, idx) in options.filter(
                                    (item) => item != selected,
                                )"
                                class="w-[95%] mx-auto px-1 py-0.5 border-t border-mm-gray"
                                @click="select(option)"
                                :key="idx"
                            >
                                {{ option }}
                            </li>
                        </ul>
                    </div>
                </div>

                <hr class="border-mm-gray border mt-3 mb-4" />

                <div class="flex flex-col">
                    <div
                        v-for="(item, idx) in doctypesData.filter(
                            (item) => item.label != 'Početna',
                        )"
                        class="flex py-2 first:pt-1 last:pb-0 pe-1 items-end justify-between not-first:border-t not-first:border-mm-gray font-semibold"
                        :key="idx"
                    >
                        <div class="flex items-center gap-4">
                            <component :is="item.icon" />
                            <span class="text-xl">{{ item.label }}</span>
                        </div>
                        <span class="text-xl">{{ idx }}</span>
                    </div>
                </div>
            </div>

            <!-- Računi -->
            <div class="dashboard-section">
                <div class="flex gap-2 items-center">
                    <CreditCard class="size-8" />
                    <span class="text-[28px]">Računi</span>
                </div>
                <hr class="border-mm-gray border mt-2 mb-4" />
                <div class="flex flex-col gap-3 px-1">
                    <div
                        v-for="ent in billsTest"
                        class="flex items-center justify-between px-0.5"
                    >
                        <div class="flex flex-col tracking-wide">
                            <span class="text-xl">{{ ent.type }}</span>
                            <span class="text-md text-mm-gray"
                                >{{ ent.amount }} računa</span
                            >
                        </div>
                        <span class="text-2xl">{{ ent.total }} €</span>
                    </div>
                </div>
            </div>

            <!-- Nedavna aktivnost -->
            <div class="dashboard-section">
                <span class="text-[28px] px-1">Nedavna aktivnost</span>
                <hr class="border-mm-gray border mt-2 mb-4" />
                <div class="flex flex-col gap-3 px-1">
                    <div
                        v-if="!recentActivity"
                        class="text-lg font-semibold flex flex-col items-center"
                    >
                        <span>Nije još zabilježena</span>
                        <span>nikakva aktivnost.</span>
                    </div>
                    <div
                        v-else
                        v-for="doc in recentTest"
                        class="flex items-center gap-2"
                    >
                        <component :is="chooseIcon(doc.type)" />
                        <span class="text-xl font-semibold">{{
                            doc.name
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- User modal -->
        <ModalBase v-if="activeModal === 'info'" @click="openModal(null)">
            <div class="flex justify-between items-center">
                <span class="text-2xl">O računu</span>
                <X class="size-8" @click="openModal(null)" />
            </div>
            <hr class="border-mm-gray border my-4" />
            <div class="flex flex-col gap-2 px-1">
                <span class="text-2xl">{{ loggedUser.displayName }}</span>
                <span class="text-lg font-extralight">{{
                    loggedUser.email
                }}</span>
                <span class="font-extralight"
                    >Registriran:
                    {{
                        new Date(
                            parseInt(loggedUser.metadata.createdAt),
                        ).toLocaleDateString("hr-HR")
                    }}</span
                >
            </div>
            <hr class="border-mm-gray border my-4" />
            <div
                class="flex px-1 relative"
                :class="normalLogin ? 'justify-between' : 'justify-center pt-3'"
            >
                <button
                    v-if="normalLogin"
                    @click="openModal('changePass')"
                    class="text-mm-primary font-bold py-1.5 px-1 border rounded-lg"
                >
                    Promijeni lozinku
                </button>
                <button
                    @click="
                        normalLogin
                            ? openModal('deleteAcc')
                            : deleteGoogleAccount()
                    "
                    class="bg-mm-error/80 text-mm-lightnavy font-extrabold tracking-wider rounded-lg py-1.5 px-4"
                >
                    Obriši račun
                </button>
                <span
                    v-if="errMsg"
                    class="absolute bottom-10 text-mm-error text-sm"
                    >{{ errMsg }}</span
                >
            </div>
        </ModalBase>

        <!-- Conformation modal -->
        <ModalBase
            v-if="['changePass', 'deleteAcc'].includes(activeModal)"
            @click="openModal('info')"
        >
            <form
                @submit.prevent="
                    activeModal === 'changePass'
                        ? changePassword()
                        : deleteAccount()
                "
                class="flex flex-col gap-4"
            >
                <div class="flex justify-between items-center">
                    <span
                        class="text-mm-white font-bold text-2xl tracking-wide"
                        >{{
                            activeModal === "deleteAcc"
                                ? "Brisanje računa"
                                : "Promjena lozinke"
                        }}</span
                    >
                    <X class="size-8" @click="openModal('info')" />
                </div>
                <hr class="border-mm-gray border" />
                <div class="input-block">
                    <span
                        v-if="activeModal === 'deleteAcc'"
                        class="text-mm-error text-sm"
                        ><strong>UPOZORENJE:</strong> brisanjem računa trajno
                        gubite pristup svom računu i podacima.
                        <strong>Radnja je nepovratna.</strong> Za potvrdu
                        unesite trenutnu lozinku.</span
                    >
                    <span class="input-label">{{
                        activeModal === "deleteAcc"
                            ? "UNOS LOZINKE:"
                            : oldPassOK
                              ? "NOVA LOZINKA:"
                              : "STARA LOZINKA:"
                    }}</span>
                    <div class="input-field">
                        <input
                            :class="{ 'text-mm-white': password.length }"
                            :type="viewPass ? 'text' : 'password'"
                            placeholder="Unesi lozinku..."
                            class="w-full"
                            v-model="password"
                        />
                        <component
                            :is="viewPass ? EyeOff : Eye"
                            size="30"
                            @click="viewPass = !viewPass"
                        />
                    </div>
                </div>
                <hr class="border-mm-gray border" />
                <div class="flex justify-center pt-3 relative">
                    <button
                        type="submit"
                        :disabled="!password.length || checkPassword"
                        class="disabled:bg-mm-gray text-mm-lightnavy font-extrabold tracking-wider rounded-lg py-1.5 px-4"
                        :class="
                            activeModal === 'deleteAcc'
                                ? 'bg-mm-error/80'
                                : 'bg-mm-primary'
                        "
                    >
                        {{
                            activeModal === "deleteAcc"
                                ? "Potvrda brisanja računa"
                                : `Potvrda ${oldPassOK ? "nove" : "stare"} lozinke`
                        }}
                    </button>
                    <span
                        v-if="
                            errMsg || (oldPassOK && password && checkPassword)
                        "
                        class="absolute bottom-10 text-mm-error text-sm"
                        >{{ errMsg ? errMsg : checkPassword }}</span
                    >
                </div>
            </form>
        </ModalBase>

        <!-- Password-changed-success modal -->
        <ModalBase
            v-if="activeModal === 'succPassChange'"
            @click="openModal(null)"
        >
            <div class="flex flex-col items-center gap-5">
                <SaveCheck class="size-20 stroke-1 text-mm-success" />
                <hr class="border-mm-gray w-full" />
                <div
                    class="text-2xl text-mm-white flex flex-col items-center font-extralight"
                >
                    <span>Lozinka je</span>
                    <span>uspješno promjenjena.</span>
                    <span>Klik na ekran za izlaz.</span>
                </div>
            </div>
        </ModalBase>

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .dashboard-section {
        @apply bg-mm-lightnavy p-4 rounded-3xl text-mm-white;
    }
</style>
