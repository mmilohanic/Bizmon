<script setup>
    import AddEditItemForm from "@/components/AddEditItemForm.vue";
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import ItemInfo from "@/components/ItemInfo.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import firebaseError from "@/data/errorsData";
    import { db, loggedUser } from "@/firebase";
    import { Info, LoaderCircle, Plus, SaveCheck } from "@lucide/vue";
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
    import { onMounted, reactive, ref } from "vue";
    import { useRoute } from "vue-router";

    const route = useRoute();

    const items = ref([]);
    const selected = ref(null);
    const activeModal = ref(null);
    const errMsg = ref(null);

    const itemsForm = reactive({
        name: null,
        price: null,
        unit: null,
        description: null,
    });

    function openModal(name, item = null) {
        Object.keys(itemsForm).map(
            (key) =>
                (itemsForm[key] = name === "edit" && item ? item[key] : null),
        );

        selected.value = item;
        errMsg.value = null;
        activeModal.value = name;
    }

    async function addItem(item) {
        errMsg.value = null;
        try {
            item["owner"] = loggedUser.value.uid;
            await addDoc(collection(db, route.name), item);
            openModal("succ");
            getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
            console.log(error);
        }
    }

    async function getItems() {
        try {
            const data = await getDocs(
                query(
                    collection(db, route.name),
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

    async function editItem(item) {
        const changedItems = Object.fromEntries(
            Object.entries(item).filter(([k, v]) => v !== selected.value[k]),
        );

        try {
            await updateDoc(
                doc(db, route.name, selected.value.id),
                changedItems,
            );
            openModal(null);
            getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function delItem() {
        errMsg.value = null;

        try {
            await deleteDoc(doc(db, route.name, selected.value.id));
            openModal(null);
            getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    onMounted(async () => await getItems());
</script>

<template>
    <div class="bg-mm-dark h-screen">
        <DashboardHeader class="fixed top-0 w-full z-10" />

        <!-- Gumb za dodavanje -->
        <div
            @click="openModal('add')"
            class="fixed bottom-26 right-6 z-10 bg-mm-primary p-1.5 rounded-full"
        >
            <Plus class="size-11" />
        </div>

        <!-- Prikaz artikala, klijenata i dokumenata -->
        <div class="py-26 px-8 flex flex-col gap-4">
            <!-- Obavijest o učitavanju elemenata -->
            <div
                v-if="!items.length"
                class="w-full text-mm-white flex gap-2 justify-center items-center"
            >
                <LoaderCircle class="animate-spin" />
                <span class="text-xl"
                    >Učitavanje
                    <span class="animate-pulse">...</span>
                </span>
            </div>

            <!-- Učitavanje artikala -->
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
            v-if="
                ['add', 'edit'].includes(activeModal) && route.name === 'items'
            "
            @click="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
            title="Unos artikla"
            @exit="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
        >
            <AddEditItemForm
                :err-msg="errMsg"
                :form-values="itemsForm"
                :is-edit="activeModal === 'edit'"
                :selected="selected"
                @add="addItem(itemsForm)"
                @edit="editItem(itemsForm)"
            />
        </ModalBase>

        <!-- Modal za info artikla -->
        <ModalBase
            v-if="activeModal === 'info' && route.name === 'items'"
            @click="openModal(null)"
            :title="selected.name"
            @exit="openModal(null)"
        >
            <ItemInfo
                v-model="errMsg"
                :selected="selected"
                @edit="openModal('edit', selected)"
                @delete="delItem()"
            />
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

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>
