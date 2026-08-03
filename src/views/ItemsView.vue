<script setup>
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import firebaseError from "@/data/errorsData";
    import { db, loggedUser } from "@/firebase";
    import { ChevronDown, Info, Plus, SaveCheck } from "@lucide/vue";
    import {
        addDoc,
        collection,
        deleteDoc,
        doc,
        getDocs,
        orderBy,
        query,
        updateDoc,
        where,
    } from "firebase/firestore";
    import { computed, onMounted, reactive, ref } from "vue";

    const items = ref([]);
    const selItem = ref(null);
    const activeModal = ref(null);
    const units = ["kom", "kpl", "sat", "m", "m²", "m³", "kg", "l"];
    const delAttempt = ref(false);
    const errMsg = ref(null);
    const dropdownOpen = ref(false);

    const formValues = reactive({
        name: null,
        price: null,
        unit: null,
        description: null,
    });

    function select(option) {
        formValues.unit = option;
        dropdownOpen.value = false;
    }

    function openModal(name, item = null) {
        Object.keys(formValues).map(
            (key) =>
                (formValues[key] = name === "edit" && item ? item[key] : null),
        );

        if (name !== "edit") selItem.value = item;

        errMsg.value = null;
        activeModal.value = name;
        delAttempt.value = false;
    }

    const formValid = computed(
        () => formValues.name && formValues.price && formValues.unit,
    );

    const formEdited = computed(
        () =>
            activeModal.value === "edit" &&
            Object.keys(formValues).some(
                (key) => formValues[key] !== selItem.value[key],
            ),
    );

    async function addItem() {
        if (formValid.value) {
            errMsg.value = null;
            try {
                formValues["owner"] = loggedUser.value.uid;
                await addDoc(collection(db, "items"), formValues);
                openModal("succ");
                getItems();
            } catch (error) {
                errMsg.value = firebaseError(error.code);
            }
        }
    }

    async function getItems() {
        try {
            const data = await getDocs(
                query(
                    collection(db, "items"),
                    where("owner", "==", loggedUser.value.uid),
                    orderBy("name", "asc"),
                ),
            );

            items.value = data.docs.map((d) =>
                Object.assign(d.data(), { id: d.id }),
            );
        } catch (error) {
            alert(firebaseError(error));
        }
    }

    async function editItem() {
        const changedItems = Object.fromEntries(
            Object.entries(formValues).filter(
                ([k, v]) => v !== selItem.value[k],
            ),
        );

        try {
            await updateDoc(doc(db, "items", selItem.value.id), changedItems);
            openModal(null);
            getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function delItem() {
        errMsg.value = null;

        try {
            await deleteDoc(doc(db, "items", selItem.value.id));
            openModal(null);
            getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
            delAttempt.value = false;
        }
    }

    onMounted(async () => await getItems());
</script>

<template>
    <div class="bg-mm-dark h-screen">
        <DashboardHeader class="fixed top-0 w-full z-10" />

        <div
            @click="openModal('add')"
            class="fixed bottom-26 right-6 z-10 bg-mm-primary p-1.5 rounded-full"
        >
            <Plus class="size-11" />
        </div>

        <div class="py-26 px-8 flex flex-col gap-4">
            <div
                v-for="item in items"
                class="bg-mm-lightnavy rounded-2xl p-4 flex flex-col gap-2"
                :key="item.id"
            >
                <div class="flex justify-between items-center">
                    <span class="text-mm-white text-xl font-medium">{{
                        item.name
                    }}</span>
                    <Info
                        @click="openModal('info', item)"
                        class="text-mm-neutral"
                    />
                </div>
                <hr class="text-mm-gray" />
                <div
                    class="flex justify-between items-center text-mm-gray font-semibold"
                >
                    <span>Jedinična cijena:</span>
                    <span>{{ item.price + " €/" + item.unit }}</span>
                </div>
            </div>
        </div>

        <!-- Modal za unos i izmjenu artikla -->
        <ModalBase
            v-if="['add', 'edit'].includes(activeModal)"
            @click="
                activeModal === 'edit'
                    ? openModal('info', selItem)
                    : openModal(null)
            "
            title="Unos artikla"
            @exit="
                activeModal === 'edit'
                    ? openModal('info', selItem)
                    : openModal(null)
            "
        >
            <form
                @submit.prevent="
                    activeModal === 'edit' ? editItem() : addItem()
                "
                class="main-modal-container"
            >
                <div class="entry-block-v">
                    <label for="add-name" class="entry-label"
                        >NAZIV ARTIKLA:</label
                    >
                    <input
                        id="add-name"
                        type="text"
                        class="entry-field"
                        placeholder="npr. Prijenosno računalo"
                        autocomplete="off"
                        v-model="formValues.name"
                    />
                </div>
                <div class="entry-block-h">
                    <label for="add-price" class="entry-label text-nowrap"
                        >JEDINIČNA CIJENA:</label
                    >
                    <div class="relative flex items-center">
                        <input
                            id="add-price"
                            type="number"
                            class="entry-field w-full text-end max-w-22"
                            style="padding-right: 27px"
                            placeholder="0.0"
                            step="any"
                            v-model.number="formValues.price"
                        />
                        <span class="text-mm-white text-lg absolute right-2.5"
                            >€</span
                        >
                    </div>
                </div>
                <div class="entry-block-h">
                    <label for="add-unit" class="entry-label text-nowrap"
                        >JEDINIČNA MJERA:</label
                    >
                    <div id="add-unit" class="relative w-full max-w-22">
                        <div
                            class="entry-field flex justify-between items-center border border-transparent border-b-0 min-h-11 max-h-11"
                            :class="{
                                ' rounded-b-none! border-mm-white!':
                                    dropdownOpen,
                            }"
                            @click="dropdownOpen = !dropdownOpen"
                        >
                            <span>{{ formValues.unit }}</span>
                            <ChevronDown class="size-5" />
                        </div>

                        <ul
                            v-if="dropdownOpen"
                            class="absolute w-full bg-mm-navy text-mm-white rounded-b-xl max-h-40 overflow-y-auto border border-mm-white border-t-0"
                        >
                            <li
                                v-for="(option, idx) in units.filter(
                                    (item) => item != formValues.unit,
                                )"
                                class="mx-auto py-1 px-2"
                                @click="select(option)"
                                :key="idx"
                            >
                                {{ option }}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="entry-block-v">
                    <label for="add-desc" class="entry-label"
                        >OPIS ARTIKLA:</label
                    >
                    <textarea
                        id="add-desc"
                        class="entry-field"
                        rows="3"
                        placeholder='npr. Dell 15.6" FHD IPS 120hZ...'
                        v-model="formValues.description"
                    ></textarea>
                </div>
                <hr class="border-mm-gray border" />
                <div class="flex justify-center pt-3 relative">
                    <button
                        :disabled="
                            !formValid ||
                            (activeModal === 'edit' && !formEdited)
                        "
                        type="submit"
                        class="form-submit-btn disabled:bg-mm-gray!"
                    >
                        {{
                            activeModal === "edit"
                                ? "UREDI ARTIKL"
                                : "UNESI ARTIKL"
                        }}
                    </button>
                    <span
                        v-if="errMsg"
                        class="absolute bottom-10 text-mm-error text-sm"
                        >{{ errMsg }}</span
                    >
                </div>
            </form>
        </ModalBase>

        <!-- Modal obavijesti uspjeha -->
        <ModalBase
            v-if="activeModal === 'succ'"
            @click="openModal(null)"
            :hide-title="true"
        >
            <div class="flex flex-col items-center gap-5">
                <SaveCheck class="size-20 stroke-1 text-mm-success" />
                <hr class="border-mm-gray w-full" />
                <div
                    class="text-2xl text-mm-white flex flex-col items-center font-extralight"
                >
                    <span>Artikl je uspješno unesen.</span>
                    <span>Klik izvan okvira za izlaz.</span>
                </div>
            </div>
        </ModalBase>

        <!-- Modal za info artikla -->
        <ModalBase
            v-if="activeModal === 'info'"
            @click="openModal(null)"
            :title="selItem.name"
            @exit="openModal(null)"
        >
            <div class="main-modal-container">
                <div class="flex justify-between items-center px-1">
                    <span class="entry-label">CIJENA:</span>
                    <span class="text-lg">{{
                        selItem.price + " €/" + selItem.unit
                    }}</span>
                </div>
                <div
                    class="flex px-1"
                    :class="
                        selItem.description
                            ? 'flex-col gap-2'
                            : 'justify-between'
                    "
                >
                    <span class="entry-label">OPIS:</span>
                    <span class="ps-4 text-lg">{{
                        selItem.description ?? "Nema opisa"
                    }}</span>
                </div>
                <hr class="border-mm-gray border" />
                <div class="flex justify-center px-1 relative pt-3">
                    <div class="flex gap-4 justify-between w-full">
                        <button
                            @click="openModal('edit', selItem)"
                            class="text-mm-primary font-bold py-1.5 border rounded-lg w-1/2"
                        >
                            Uredi artikl
                        </button>
                        <button
                            @click="
                                delAttempt
                                    ? delItem()
                                    : ((delAttempt = true), (errMsg = null))
                            "
                            class="rounded-lg py-1.5 w-1/2"
                            :class="
                                delAttempt
                                    ? 'bg-mm-error/80 text-mm-lightnavy font-extrabold tracking-wider'
                                    : 'border border-mm-error text-mm-error font-bold'
                            "
                        >
                            Obriši artikl
                        </button>
                    </div>
                    <span
                        v-if="errMsg || delAttempt"
                        class="absolute bottom-10 text-mm-error text-sm"
                        >{{
                            errMsg
                                ? errMsg
                                : "Ponovo pritisnuti gumb za potvrdu brisanja!"
                        }}</span
                    >
                </div>
            </div>
        </ModalBase>

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .main-modal-container {
        @apply flex flex-col gap-4;
    }

    .entry-block-v {
        @apply flex flex-col gap-4;
    }

    .entry-block-h {
        @apply flex justify-between items-center;
    }

    .entry-label {
        @apply text-mm-white text-xl font-semibold tracking-wide;
    }

    .entry-field {
        @apply bg-mm-navy rounded-xl px-2.5 py-2;
        @apply text-mm-white placeholder:text-mm-gray text-lg;
    }

    .form-submit-btn {
        @apply bg-mm-primary rounded-full py-1.5 px-10 w-fit mx-auto;
        @apply text-mm-lightnavy font-extrabold tracking-wider;
    }
</style>
