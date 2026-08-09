<script setup>
    import CardBase from "@/components/CardBase.vue";
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import firebaseError from "@/data/errorsData";
    import routesData from "@/data/routesData";
    import {
        createDocument,
        deleteDocument,
        readCollection,
        updateDocument,
    } from "@/firebase";
    import { formatPrice } from "@/utils/formatUtils";
    import { Info, LoaderCircle, Plus, SaveCheck } from "@lucide/vue";
    import { onMounted, ref } from "vue";
    import { useRoute } from "vue-router";

    const route = useRoute();

    const items = ref([]);
    const selected = ref(null);
    const activeModal = ref(null);
    const errMsg = ref(null);
    const loading = ref(true);

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

    async function addData(item) {
        errMsg.value = null;
        try {
            item = handleBlanks(item);
            await createDocument(route.name, item);

            openModal("succ");
            await getData();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function getData(name = route.name, sortBy = "name", dir = "asc") {
        try {
            items.value = await readCollection(name, sortBy, dir);
        } catch (error) {
            alert(firebaseError(error));
            console.log(error);
        }
    }

    async function editData(item) {
        const changedItems = handleBlanks(
            Object.fromEntries(
                Object.entries(item).filter(
                    ([k, v]) => v !== selected.value[k],
                ),
            ),
        );

        try {
            await updateDocument(route.name, changedItems, selected.value.id);
            openModal(null);
            await getData();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function delData() {
        errMsg.value = null;

        try {
            await deleteDocument(route.name, selected.value.id);
            openModal(null);
            await getData();
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    function statusStyle(status) {
        const color = routesData[route.name].status[status];
        return `border-mm-${color} text-mm-${color}`;
    }

    onMounted(async () => {
        await getData();
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
                <span>{{ routesData[route.name].infoMsgs.none }}</span>
                <span>za prikazivanje</span>
            </div>

            <!-- Učitavanje artikala i klijenata -->
            <CardBase
                v-if="['items', 'clients'].includes(route.name)"
                v-for="(item, idx) in items"
                class="bg-mm-lightnavy rounded-2xl p-4"
                :key="idx"
            >
                <div class="separate-and-center">
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
                    class="separate-and-center text-mm-gray font-semibold"
                >
                    <span>Jedinična cijena:</span>
                    <span>{{ item.price + " €/" + item.unit }}</span>
                </div>
            </CardBase>

            <!-- Učitavanje dokumenata -->
            <CardBase
                v-if="
                    ['quotes', 'orders', 'work-orders', 'invoices'].includes(
                        route.name,
                    )
                "
                v-for="(item, idx) in items"
                class="bg-mm-lightnavy rounded-2xl p-4"
                :route-to="`/${route.name}/${item.id}`"
                :key="idx"
            >
                <div class="separate-and-center">
                    <span class="text-mm-white text-xl font-medium">{{
                        item.name
                    }}</span>
                    <Info
                        @click="openModal('info', item)"
                        class="text-mm-neutral"
                    />
                </div>
                <hr class="text-mm-gray" />
                <div class="separate-and-center text-mm-gray font-semibold">
                    <span>Kreirano:</span>
                    <span>{{
                        item.createdAt.toDate().toLocaleDateString("hr-HR")
                    }}</span>
                </div>
                <div class="separate-and-center">
                    <span class="text-mm-gray font-semibold">Status:</span>
                    <span
                        class="border rounded-full px-2"
                        :class="statusStyle(item.status)"
                        >{{ item.status }}</span
                    >
                </div>
                <div class="separate-and-center text-mm-gray font-semibold">
                    <span>Vrijednost:</span>
                    <span>{{ formatPrice(item.total) }}</span>
                </div>
            </CardBase>
        </div>

        <!-- Modal za unos i izmjenu artikla, klijenta i dokumenta -->
        <ModalBase
            v-if="['add', 'edit'].includes(activeModal)"
            @click="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
            :title="routesData[route.name].modalTitles[activeModal]"
            @exit="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
        >
            <component
                :is="routesData[route.name].addEditModal"
                :err-msg="errMsg"
                :is-edit="activeModal === 'edit'"
                :selected="selected"
                @add="(item) => addData(item)"
                @edit="(item) => editData(item)"
            />
        </ModalBase>

        <!-- Modal za info artikla i klijenata -->
        <ModalBase
            v-if="activeModal === 'info'"
            @click="openModal(null)"
            :title="selected.name"
            @exit="openModal(null)"
        >
            <component
                :is="routesData[route.name].infoModal"
                v-model="errMsg"
                :selected="selected"
                @edit="openModal('edit', selected)"
                @delete="delData()"
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
                    class="text-2xl text-mm-white flex flex-col items-center font-extralight text-center"
                >
                    <span>{{ routesData[route.name].infoMsgs.succ }}</span>
                    <span>Klik izvan okvira za izlaz.</span>
                </div>
            </div>
        </ModalBase>

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>
