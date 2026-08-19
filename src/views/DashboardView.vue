<script setup>
    import AppLayout from "@/components/AppLayout.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import doctypesData from "@/data/doctypesData";
    import firebaseError from "@/data/errorsData";
    import { auth, db, loggedUser, readCollection, userData } from "@/firebase";
    import filterByDateRange from "@/utils/filterUtils";
    import { formatPrice } from "@/utils/formatUtils";
    import {
        ChartNoAxesCombined,
        ChevronDown,
        CreditCard,
        Eye,
        EyeOff,
        SaveCheck,
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
    import { computed, onMounted, reactive, ref } from "vue";
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

    const documents = reactive({
        quotes: [],
        orders: [],
        "work-orders": [],
        invoices: [],
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const options = [
        { label: "ovaj mjesec", start: new Date(year, month, 1) },
        {
            label: "prošli mjesec",
            start: new Date(year, month - 1, 1),
            end: new Date(year, month, 0),
        },
        { label: "zadnja 3 mjeseca", start: new Date(year, month - 3, day) },
        { label: "zadnjih 6 mjeseci", start: new Date(year, month - 6, day) },
        {
            label: "zadnjih godinu dana",
            start: new Date(year - 1, month, day),
        },
        { label: "svi dokumenti", start: null },
    ];

    const selected = ref(options[0]);
    const open = ref(false);

    const documentCounts = computed(() =>
        Object.fromEntries(
            Object.keys(documents).map((key) => [
                key,
                filterByDateRange(
                    documents[key],
                    selected.value.start,
                    selected.value.end,
                ).length,
            ]),
        ),
    );

    const invoicesInfo = computed(() => {
        const result = [
            {
                label: "Naplaćeno",
                count: 0,
                sum: 0,
            },
            {
                label: "Otvoreno",
                count: 0,
                sum: 0,
            },
        ];

        const filteredInvoices = filterByDateRange(
            documents.invoices,
            selected.value.start,
            selected.value.end,
        );

        filteredInvoices.forEach((inv) => {
            const idx = Number(inv.status !== "Plaćen");
            result[idx].count += 1;
            result[idx].sum += inv.total;
        });

        return result;
    });

    function select(option) {
        selected.value = option;
        open.value = false;
    }

    function chooseIcon(docType) {
        return doctypesData.find((el) => el.path.includes(docType)).icon;
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

    onMounted(async () => {
        try {
            Object.keys(documents).map(
                async (key) =>
                    (documents[key] = await readCollection(
                        key,
                        "createdAt",
                        "desc",
                    )),
            );
        } catch (error) {
            alert(firebaseError(error.code));
        }
    });
</script>

<template>
    <AppLayout
        :info-active="activeModal === 'info'"
        @open-info="openModal('info')"
        class="overflow-clip"
    >
        <div
            class="top-0 flex items-center justify-between gap-4 bg-mm-navy border-y md:border-t-0 border-mm-gray px-8 py-2.5"
        >
            <span class="text-xl font-semibold">Razdoblje:</span>

            <!-- Filter dropdown -->
            <div class="relative w-full max-w-xs">
                <div
                    class="flex bg-mm-lightnavy text-mm-white border border-mm-gray ps-2 pe-1 py-0.5 rounded justify-between items-center cursor-pointer"
                    :class="{
                        'rounded-b-none border-b-transparent': open,
                    }"
                    @click="open = !open"
                >
                    <span>{{ selected.label }}</span>
                    <ChevronDown />
                </div>

                <ul
                    v-if="open"
                    class="absolute w-full bg-mm-lightnavy text-mm-white border border-mm-gray border-t-0 rounded-b shadow-xl shadow-mm-dark cursor-pointer"
                >
                    <li
                        v-for="(option, idx) in options.filter(
                            (item) => item != selected,
                        )"
                        class="w-[95%] mx-auto px-1 py-0.5 border-t border-mm-gray"
                        @click="select(option)"
                        :key="idx"
                    >
                        {{ option.label }}
                    </li>
                </ul>
            </div>
        </div>

        <div class="py-6 px-8 flex flex-col gap-4 overflow-y-auto">
            <!-- Statistika -->
            <div class="dashboard-section">
                <div class="flex justify-between items-center gap-2">
                    <div class="flex gap-2 items-start">
                        <ChartNoAxesCombined class="size-8 mt-0.5" />
                        <span class="text-[28px]">Statistika</span>
                    </div>
                </div>

                <hr class="border-mm-gray border mt-3 mb-4" />

                <div class="flex flex-col">
                    <div
                        v-for="(item, idx) in doctypesData.filter(
                            (i) => i.label != 'Početna' && !i.menuItem,
                        )"
                        class="flex py-2 first:pt-1 last:pb-0 pe-1 items-end justify-between not-first:border-t not-first:border-mm-gray font-semibold"
                        :key="idx"
                    >
                        <div class="flex items-center gap-4">
                            <component :is="item.icon" />
                            <span class="text-xl">{{ item.label }}</span>
                        </div>
                        <span class="text-xl">{{
                            documentCounts[item.path.slice(1)]
                        }}</span>
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
                        v-for="item in invoicesInfo"
                        class="flex items-center justify-between px-0.5"
                    >
                        <div class="flex flex-col tracking-wide">
                            <span class="text-xl">{{ item.label }}</span>
                            <span class="text-md text-mm-gray"
                                >Ukupno: {{ item.count }}</span
                            >
                        </div>
                        <span class="text-2xl">{{
                            formatPrice(item.sum)
                        }}</span>
                    </div>
                </div>
            </div>

            <!-- Nedavna aktivnost -->
            <div class="dashboard-section">
                <span class="text-[28px] px-1">Nedavna aktivnost</span>
                <hr class="border-mm-gray border mt-2 mb-4" />
                <div class="flex flex-col gap-3 px-1">
                    <RouterLink
                        v-if="userData && userData.recentDocuments.length"
                        v-for="doc in userData.recentDocuments"
                        :to="`/${doc.docType}/${doc.docId}`"
                        class="flex items-center gap-2"
                    >
                        <component :is="chooseIcon(doc.docType)" />
                        <span class="text-xl font-semibold">{{
                            doc.docName
                        }}</span>
                    </RouterLink>
                    <div
                        v-else
                        class="text-lg font-semibold flex flex-col items-center"
                    >
                        <span>Nije još zabilježena</span>
                        <span>nikakva aktivnost.</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info modal -->
        <ModalBase
            v-if="activeModal === 'info'"
            @click="openModal(null)"
            title="O računu"
            @exit="openModal(null)"
        >
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
                class="flex px-1 relative pt-2"
                :class="normalLogin ? 'justify-between' : 'justify-center pt-3'"
            >
                <button
                    v-if="normalLogin"
                    @click="openModal('changePass')"
                    class="text-mm-primary font-bold py-1.5 px-1 border rounded-lg"
                >
                    Promjena lozinke
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

        <!-- Modal potvrde izmjene lozinke i brisanja računa -->
        <ModalBase
            v-if="['changePass', 'deleteAcc'].includes(activeModal)"
            @click="openModal('info')"
            :title="
                activeModal === 'deleteAcc'
                    ? 'Brisanje računa'
                    : 'Promjena lozinke'
            "
            @exit="openModal('info')"
        >
            <form
                @submit.prevent="
                    activeModal === 'changePass'
                        ? changePassword()
                        : deleteAccount()
                "
                class="flex flex-col gap-4"
            >
                <div class="input-block-v">
                    <span
                        v-if="activeModal === 'deleteAcc'"
                        class="text-mm-error text-sm"
                        ><strong>UPOZORENJE:</strong> brisanjem računa trajno
                        gubite pristup svom računu i podacima.
                        <strong>Radnja je nepovratna.</strong> Za potvrdu
                        unesite trenutnu lozinku.</span
                    >
                    <span class="input-label font-bold">{{
                        activeModal === "deleteAcc"
                            ? "UNOS LOZINKE:"
                            : oldPassOK
                              ? "NOVA LOZINKA:"
                              : "STARA LOZINKA:"
                    }}</span>
                    <div class="log-reg-field">
                        <input
                            :class="{ 'text-mm-white': password.length }"
                            :type="viewPass ? 'text' : 'password'"
                            placeholder="Unesi lozinku..."
                            class="w-full px-1"
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

        <!-- Modal uspješne promjene lozinke -->
        <ModalBase
            v-if="activeModal === 'succPassChange'"
            @click="openModal(null)"
            :hide-title="true"
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
    </AppLayout>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .dashboard-section {
        @apply bg-mm-lightnavy p-4 rounded-3xl text-mm-white;
    }
</style>
