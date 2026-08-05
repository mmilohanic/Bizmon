<script setup>
    import AddEditClientForm from "@/components/AddEditClientForm.vue";
    import AddEditItemForm from "@/components/AddEditItemForm.vue";
    import ClientInfo from "@/components/ClientInfo.vue";
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
    import { onMounted, ref } from "vue";
    import { useRoute } from "vue-router";

    const infoMsgs = {
        items: {
            none: "Nema artikala",
            succ: "Artikl je uspješno unesen.",
        },
        clients: {
            none: "Nema klijenata",
            succ: "Klijent je uspješno unesen.",
        },
        quotes: {
            none: "Nema ponuda",
            succ: "Ponuda je uspješno unesena.",
        },
        orders: {
            none: "Nema narudžbi",
            succ: "Narudžba je uspješno unesena.",
        },
        "work-orders": {
            none: "Nema radnih naloga",
            succ: "Radni nalog je uspješno unesen.",
        },
        invoices: {
            none: "Nema računa",
            succ: "Račun je uspješno unesen.",
        },
    };

    const modalTitles = {
        items: {
            add: "Unos artikla",
            edit: "Uredi artikl",
        },
        clients: {
            add: "Unos klijenta",
            edit: "Uredi klijenta",
        },
    };

    const route = useRoute();

    const items = ref([]);
    const selected = ref(null);
    const activeModal = ref(null);
    const errMsg = ref(null);
    const loading = ref(false);

    function openModal(name, item = null) {
        selected.value = item;
        errMsg.value = null;
        activeModal.value = name;
    }

    function handleBlanks(item) {
        return Object.fromEntries(
            Object.entries(item).map(([k, v]) => [k, v === "" ? null : v]),
        );
    }

    async function addItem(item) {
        errMsg.value = null;
        try {
            item = handleBlanks(item);
            item["owner"] = loggedUser.value.uid;
            await addDoc(collection(db, route.name), item);
            openModal("succ");
            await getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function getItems(collectionName = route.name) {
        try {
            const data = await getDocs(
                query(
                    collection(db, collectionName),
                    where("owner", "==", loggedUser.value.uid),
                    orderBy("name", "asc"),
                ),
            );

            items.value = data.docs.map((d) =>
                Object.assign(d.data(), { id: d.id }),
            );
        } catch (error) {
            alert(firebaseError(error));
            console.log(error);
        }
    }

    async function editItem(item) {
        const changedItems = handleBlanks(
            Object.fromEntries(
                Object.entries(item).filter(
                    ([k, v]) => v !== selected.value[k],
                ),
            ),
        );

        try {
            await updateDoc(
                doc(db, route.name, selected.value.id),
                changedItems,
            );
            openModal(null);
            await getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function delItem() {
        errMsg.value = null;

        try {
            await deleteDoc(doc(db, route.name, selected.value.id));
            openModal(null);
            await getItems();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    onMounted(async () => {
        loading.value = true;
        await getItems();
        loading.value = false;
    });
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
        <div class="py-26 px-8 flex flex-col gap-4 h-full">
            <!-- Obavijest o učitavanju elemenata -->
            <div
                v-if="loading"
                class="w-full h-full text-mm-white flex gap-2 justify-center items-center"
            >
                <LoaderCircle class="animate-spin" />
                <span class="text-2xl"
                    >Učitavanje
                    <span class="animate-pulse">...</span>
                </span>
            </div>

            <!-- Obavijest o nepostojanju elemenata -->
            <div
                v-if="!(loading || items.length)"
                class="w-full h-full text-mm-white flex flex-col justify-center items-center text-2xl"
            >
                <span>{{ infoMsgs[route.name].none }}</span>
                <span>za prikazivanje</span>
            </div>

            <!-- Učitavanje artikala i klijenata -->
            <div
                v-if="['items', 'clients'].includes(route.name)"
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
                <hr v-if="route.name === 'items'" class="text-mm-gray" />
                <div
                    v-if="route.name === 'items'"
                    class="flex justify-between items-center text-mm-gray font-semibold"
                >
                    <span>Jedinična cijena:</span>
                    <span>{{ item.price + " €/" + item.unit }}</span>
                </div>
            </div>

            <!-- Učitavanje dokumenata -->
            <div
                v-if="
                    ['qoutes', 'orders', 'work-orders', 'invoices'].includes(
                        route.name,
                    )
                "
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
                <hr v-if="route.name === 'items'" class="text-mm-gray" />
                <div
                    v-if="route.name === 'items'"
                    class="flex justify-between items-center text-mm-gray font-semibold"
                >
                    <span>Jedinična cijena:</span>
                    <span>{{ item.price + " €/" + item.unit }}</span>
                </div>
            </div>
        </div>

        <!-- Modal za unos i izmjenu artikla i klijenata -->
        <ModalBase
            v-if="
                ['add', 'edit'].includes(activeModal) &&
                ['items', 'clients'].includes(route.name)
            "
            @click="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
            :title="modalTitles[route.name][activeModal]"
            @exit="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
        >
            <component
                :is="
                    route.name === 'items' ? AddEditItemForm : AddEditClientForm
                "
                :err-msg="errMsg"
                :is-edit="activeModal === 'edit'"
                :selected="selected"
                @add="(item) => addItem(item)"
                @edit="(item) => editItem(item)"
            />
        </ModalBase>

        <!-- Modal za info artikla i klijenata -->
        <ModalBase
            v-if="
                activeModal === 'info' &&
                ['items', 'clients'].includes(route.name)
            "
            @click="openModal(null)"
            :title="selected.name"
            @exit="openModal(null)"
        >
            <component
                :is="route.name === 'items' ? ItemInfo : ClientInfo"
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
                    <span>{{ infoMsgs[route.name].succ }}</span>
                    <span>Klik izvan okvira za izlaz.</span>
                </div>
            </div>
        </ModalBase>

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>
