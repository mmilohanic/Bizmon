<script setup>
    import AppLayout from "@/components/AppLayout.vue";
    import CardBase from "@/components/CardBase.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import firebaseError from "@/data/errorsData";
    import routesData from "@/data/routesData";
    import {
        createDocument,
        deleteDocument,
        loggedUser,
        readCollection,
        updateDocument,
        userData,
    } from "@/firebase";
    import filterByDateRange from "@/utils/filterUtils";
    import { formatPrice } from "@/utils/formatUtils";
    import {
        ArrowDown,
        ArrowRight,
        ArrowUp,
        Info,
        LoaderCircle,
        Plus,
        SaveCheck,
        X,
    } from "@lucide/vue";
    import { Timestamp } from "firebase/firestore";
    import {
        computed,
        nextTick,
        onMounted,
        ref,
        useTemplateRef,
        watch,
    } from "vue";
    import { useRoute, useRouter } from "vue-router";

    const route = useRoute();
    const router = useRouter();

    const items = ref([]);
    const selected = ref(null);
    const activeModal = ref(null);
    const errMsg = ref(null);
    const loading = ref(true);
    const newDoc = ref(null);
    const showSearch = ref(false);
    const searchPhrase = ref("");
    const searchField = useTemplateRef("searchField");
    const filterFrom = ref("");
    const filterTo = ref("");
    const sortBy = ref("createdAt");
    const sortDir = ref("desc");
    const filteredSortedItems = ref(null);

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

    function filterAndSort() {
        function parseDate(date) {
            if (!date.length) return;

            const [y, m, d] = date.split("-").map(Number);
            return new Date(y, m - 1, d);
        }

        filteredSortedItems.value = filterByDateRange(
            items.value,
            parseDate(filterFrom.value),
            parseDate(filterTo.value),
        );

        filteredSortedItems.value.sort(
            (a, b) =>
                (sortDir.value === "asc"
                    ? a[sortBy.value] - b[sortBy.value]
                    : b[sortBy.value] - a[sortBy.value]) ||
                a.name.localeCompare(b.name),
        );

        openModal(null);
    }

    const displayItems = computed(() => {
        const prioritized = filteredSortedItems.value ?? items.value;

        return prioritized.filter((item) =>
            `${item.name} ${item.clientName}`
                .toLowerCase()
                .includes(searchPhrase.value.toLowerCase()),
        );
    });

    async function addData(item) {
        errMsg.value = null;
        try {
            item = handleBlanks(item);
            newDoc.value = await createDocument(route.name, item);

            if (routesData[route.name].isDocument)
                item["createdAt"] = Timestamp.now();

            item["id"] = newDoc.value.id;
            items.value.push(item);

            openModal("succ");
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function getData(name, sortBy, dir) {
        try {
            items.value = await readCollection(name, sortBy, dir);
        } catch (error) {
            alert(firebaseError(error));
        }
    }

    async function editData(item) {
        const changedValues = handleBlanks(
            Object.fromEntries(
                Object.entries(item).filter(
                    ([k, v]) => v !== selected.value[k],
                ),
            ),
        );

        try {
            await updateDocument(route.name, changedValues, selected.value.id);

            Object.assign(
                items.value.find((i) => i.id === item.id),
                changedValues,
            );

            openModal(null);
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    async function delData() {
        errMsg.value = null;

        try {
            await deleteDocument(route.name, selected.value.id);

            items.value.splice(
                items.value.findIndex((i) => i.id === selected.value.id),
                1,
            );

            const recentsIdx = userData.value.recentDocuments.find(
                (item) => item.docId === selected.value.id,
            );
            if (recentsIdx !== -1) {
                const newRecents = userData.value.recentDocuments.toSpliced(
                    recentsIdx,
                    1,
                );

                updateDocument(
                    "users",
                    {
                        recentDocuments: newRecents,
                    },
                    loggedUser.value.uid,
                );

                userData.value.recentDocuments = newRecents;
            }

            openModal(null);
        } catch (error) {
            errMsg.value = firebaseError(error.code);
        }
    }

    function statusStyle(status) {
        const color = routesData[route.name].status[status];
        return `border-mm-${color} text-mm-${color}`;
    }

    watch(showSearch, async (open) => {
        if (open) {
            await nextTick();
            searchField.value.focus();
        }
    });

    onMounted(async () => {
        routesData[route.name].isDocument
            ? await getData(route.name, "createdAt", "desc")
            : await getData(route.name, "name", "asc");

        loading.value = false;
    });
</script>

<template>
    <AppLayout
        :filter-opened="activeModal === 'filter'"
        :filter-active="Boolean(filteredSortedItems)"
        @open-filter="openModal('filter')"
        v-model:hide-header="showSearch"
    >
        <!-- Tražilica -->
        <div
            v-if="showSearch"
            class="bg-mm-navy h-20 grid place-items-center p-4 md:border-b md:border-mm-gray"
        >
            <div
                class="bg-mm-lightnavy border border-mm-gray flex size-full rounded-xl p-1"
            >
                <input
                    ref="searchField"
                    type="text"
                    class="w-full placeholder:text-mm-gray text-mm-white focus:outline-none px-3"
                    placeholder="Unesi pojam..."
                    v-model="searchPhrase"
                />
                <button
                    @click="
                        showSearch = false;
                        searchPhrase = '';
                    "
                    class="ps-1.5 pe-1 border-l border-mm-gray"
                >
                    <X class="text-mm-muted size-7" />
                </button>
            </div>
        </div>

        <!-- Gumb za dodavanje -->
        <div
            @click="openModal('add')"
            class="md:hidden fixed bottom-26 right-6 z-10 bg-mm-primary p-1.5 rounded-full border-2 border-mm-dark"
        >
            <Plus class="size-11 text-mm-navy" />
        </div>

        <!-- Prikaz artikala, klijenata i dokumenata -->
        <div class="py-6 px-8">
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

            <div v-else class="flex flex-col gap-4">
                <span
                    class="hidden md:block text-xl text-center font-bold text-mm-primary p-3 gap-2 w-full rounded-full border border-dashed border-mm-primary cursor-pointer"
                    @click="openModal('add')"
                >
                    {{ routesData[route.name].modalLabels.add }}
                </span>

                <!-- Obavijest o nepostojanju elemenata -->
                <div
                    v-if="!items.length"
                    class="w-full h-full md:pt-5 text-mm-white flex flex-col justify-center items-center text-2xl"
                >
                    <span>{{ routesData[route.name].infoMsgs.none }}</span>
                    <span>za prikazivanje</span>
                </div>

                <!-- Učitavanje artikala i klijenata -->
                <CardBase
                    v-if="!routesData[route.name].isDocument"
                    v-for="(item, idx) in items"
                    class="bg-mm-lightnavy rounded-2xl p-4"
                    :key="idx"
                >
                    <div class="separate-and-center">
                        <span
                            class="text-mm-white text-xl font-medium line-clamp-2"
                            >{{ item.name }}</span
                        >
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
                    v-if="routesData[route.name].isDocument"
                    v-for="(item, idx) in displayItems"
                    class="bg-mm-lightnavy rounded-2xl p-4"
                    :route-to="`/${route.name}/${item.id}`"
                    :key="idx"
                >
                    <div class="separate-and-center">
                        <span
                            class="text-mm-white text-xl font-medium line-clamp-2"
                            >{{ item.name }}</span
                        >
                        <Info
                            @click.stop.prevent="openModal('info', item)"
                            class="text-mm-neutral"
                        />
                    </div>
                    <hr class="text-mm-gray" />
                    <div
                        class="separate-and-center text-mm-muted font-semibold"
                    >
                        <span>Kreirano:</span>
                        <span>{{
                            item.createdAt.toDate().toLocaleDateString("hr-HR")
                        }}</span>
                    </div>
                    <div class="separate-and-center">
                        <span class="text-mm-muted font-semibold">Status:</span>
                        <span
                            class="border rounded-full px-2"
                            :class="statusStyle(item.status)"
                            >{{ item.status }}</span
                        >
                    </div>
                    <div
                        class="separate-and-center text-mm-muted font-semibold"
                    >
                        <span>Vrijednost:</span>
                        <span>{{ formatPrice(item.total) }}</span>
                    </div>
                </CardBase>
            </div>
        </div>

        <!-- Modal za unos i izmjenu artikla, klijenta i dokumenta -->
        <ModalBase
            v-if="['add', 'edit'].includes(activeModal)"
            @click="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
            :title="routesData[route.name].modalLabels[activeModal]"
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

        <!-- Modal za info artikla, klijenata i dokumenata -->
        <ModalBase
            v-if="activeModal === 'info'"
            @click="openModal(null)"
            :title="selected.name"
            :smaller-title="true"
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
            <div
                @click="openModal(null)"
                class="flex flex-col items-center gap-5"
            >
                <SaveCheck class="size-20 stroke-1 text-mm-success" />
                <hr class="border-mm-gray w-full" />
                <div
                    class="text-2xl text-mm-white flex flex-col items-center font-extralight text-center"
                >
                    <span>{{ routesData[route.name].infoMsgs.succ }}</span>
                </div>
                <hr class="border-mm-gray w-full" />
                <div class="flex items-center justify-center gap-4 w-full">
                    <button
                        class="button text-mm-primary border-mm-primary"
                        :class="{
                            'w-fit! px-5': !routesData[route.name].isDocument,
                        }"
                        @click="openModal(null)"
                    >
                        {{
                            routesData[route.name].isDocument
                                ? "U REDU"
                                : "NASTAVI"
                        }}
                    </button>
                    <button
                        v-if="routesData[route.name].isDocument"
                        class="button flex items-center justify-center gap-2 bg-mm-primary border-mm-primary text-mm-dark"
                        @click="
                            router.push(newDoc.path);
                            newDoc = null;
                        "
                    >
                        OTVORI
                        <ArrowRight />
                    </button>
                </div>
            </div>
        </ModalBase>

        <!-- Modal za filtriranje -->
        <ModalBase
            v-if="activeModal === 'filter'"
            @click="openModal(null)"
            title="Filtriranje i sortiranje"
            @exit="openModal(null)"
        >
            <form @submit.prevent="filterAndSort" class="flex flex-col gap-4">
                <div class="flex flex-col gap-4 px-1">
                    <div class="flex gap-2">
                        <div class="input-block-v">
                            <label for="start" class="modal-label">OD:</label>
                            <input
                                id="start"
                                name="start"
                                type="date"
                                class="input-field"
                                :max="filterTo"
                                v-model="filterFrom"
                            />
                        </div>
                        <div class="input-block-v">
                            <label for="end" class="modal-label">DO:</label>
                            <input
                                id="end"
                                name="end"
                                type="date"
                                class="input-field"
                                :min="filterFrom"
                                v-model="filterTo"
                            />
                        </div>
                    </div>
                </div>
                <hr class="text-mm-gray" />
                <div class="flex flex-col gap-4 px-1">
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <span class="modal-label">SORTIRAJ PO:</span>
                            <div class="flex gap-4">
                                <label
                                    class="sort-btn"
                                    :class="{
                                        'sort-btn-active':
                                            sortBy === 'createdAt',
                                    }"
                                    @click="sortBy = 'createdAt'"
                                >
                                    <input
                                        type="radio"
                                        name="sortBy"
                                        value="createdAt"
                                        class="sr-only"
                                    />
                                    <span>Datum</span>
                                </label>
                                <label
                                    class="sort-btn"
                                    :class="{
                                        'sort-btn-active': sortBy === 'total',
                                    }"
                                    @click="sortBy = 'total'"
                                >
                                    <input
                                        type="radio"
                                        name="sortBy"
                                        value="total"
                                        class="sr-only"
                                    />
                                    <span>Iznos</span>
                                </label>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="modal-label">SMJER:</span>
                            <div class="flex gap-2">
                                <label
                                    class="sort-btn"
                                    :class="{
                                        'sort-btn-active': sortDir === 'asc',
                                    }"
                                    @click="sortDir = 'asc'"
                                >
                                    <input
                                        type="radio"
                                        name="sortDir"
                                        value="asc"
                                        class="sr-only"
                                    />
                                    <div class="flex gap-2 items-center">
                                        <span>Rastuće</span>
                                        <ArrowUp class="stroke-3" />
                                    </div>
                                </label>
                                <label
                                    class="sort-btn"
                                    :class="{
                                        'sort-btn-active': sortDir === 'desc',
                                    }"
                                    @click="sortDir = 'desc'"
                                >
                                    <input
                                        type="radio"
                                        name="sortDir"
                                        value="desc"
                                        class="sr-only"
                                    />
                                    <div class="flex gap-2 items-center">
                                        <span>Opadajuće</span>
                                        <ArrowDown class="stroke-3" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
                <hr class="text-mm-gray" />
                <div class="flex gap-4 px-1">
                    <button
                        type="button"
                        class="button text-mm-muted border-mm-gray"
                        @click="
                            filterFrom = '';
                            filterTo = '';
                            sortBy = 'createdAt';
                            sortDir = 'desc';
                            filteredSortedItems = null;
                            openModal(null);
                        "
                    >
                        PONIŠTI
                    </button>
                    <button
                        type="submit"
                        class="button bg-mm-primary border-mm-primary text-mm-dark"
                    >
                        PRIMIJENI
                    </button>
                </div>
            </form>
        </ModalBase>
    </AppLayout>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .sort-btn {
        @apply flex items-center justify-center py-1 w-full;
        @apply font-bold text-mm-white border border-mm-muted rounded-full;
    }

    .sort-btn-active {
        @apply border-mm-primary text-mm-primary;
    }

    .modal-label {
        @apply font-semibold text-lg ps-1;
    }

    .input-block-v {
        @apply gap-1 min-w-0 w-1/2;
    }

    .input-field {
        @apply min-w-0 text-base max-w-full;
    }

    .button {
        @apply w-full h-fit py-2 mt-2;
        @apply border rounded-full font-extrabold tracking-wider;
    }
</style>
