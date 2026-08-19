<script setup>
    import AppLayout from "@/components/AppLayout.vue";
    import CardBase from "@/components/CardBase.vue";
    import ModalBase from "@/components/ModalBase.vue";
    import firebaseError from "@/data/errorsData";
    import {
        loggedUser,
        readCollection,
        readDocument,
        updateDocument,
        userData,
    } from "@/firebase";
    import { downloadPDF } from "@/utils/downloadPDF";
    import { formatPrice } from "@/utils/formatUtils";
    import {
        ChevronDown,
        LoaderCircle,
        Pencil,
        Plus,
        Trash,
    } from "@lucide/vue";
    import { computed, onMounted, reactive, ref, watch } from "vue";
    import { useRoute, useRouter } from "vue-router";

    const route = useRoute();
    const router = useRouter();

    const fsDocument = reactive({
        clientId: "",
        status: "",
        docItems: [],
        name: "",
        total: 0,
        ownerId: "",
        createdAt: {},
        description: "",
        clientName: "",
        id: "",
    });

    const clientData = ref(null);

    const selected = ref(null);
    const activeModal = ref(null);
    const errMsg = ref(null);
    const loading = ref(true);

    const blankForm = {
        name: "",
        price: null,
        unit: null,
        amount: 1,
    };
    const docItemForm = reactive({ ...blankForm });

    const units = ["kom", "kpl", "sat", "m", "m²", "m³", "kg", "l"];
    const unitDropOpen = ref(false);

    const validAmount = computed(() =>
        units.slice(2).includes(docItemForm.unit) ? "0.01" : "0",
    );

    function select(option) {
        docItemForm.unit = option;
        unitDropOpen.value = false;
    }

    const itemsDropOpen = ref(false);
    const allItems = ref([]);
    const items = computed(() =>
        allItems.value.filter(
            (c) =>
                c.name.toLowerCase().includes(docItemForm.name.toLowerCase()) &&
                c.name !== docItemForm.name,
        ),
    );

    const showDropdown = computed(
        () => itemsDropOpen.value && items.value.length,
    );

    function selectClient(item) {
        delete item.description;
        item["amount"] = 1;
        Object.assign(docItemForm, item);
        itemsDropOpen.value = false;
        document.activeElement.blur();
    }

    const formValid = computed(() =>
        Boolean(
            docItemForm.name &&
            docItemForm.price >= 0 &&
            docItemForm.unit &&
            docItemForm.amount > 0,
        ),
    );

    const formEdited = computed(
        () =>
            activeModal.value === "edit" &&
            Object.keys(docItemForm).some(
                (key) =>
                    docItemForm[key] !==
                    fsDocument.docItems[selected.value][key],
            ),
    );

    function openModal(name, idx = null) {
        selected.value = idx;
        errMsg.value = null;

        if (name === "edit" && idx >= 0) {
            Object.keys(docItemForm).map(
                (key) => (docItemForm[key] = fsDocument.docItems[idx][key]),
            );
        } else {
            Object.assign(docItemForm, blankForm);
        }

        activeModal.value = name;
    }

    function docItemsTotal(arr) {
        return arr.reduce((a, v) => a + v.price * v.amount, 0);
    }

    async function updateDocItems(newData) {
        try {
            const totalValue = docItemsTotal(newData);

            await updateDocument(
                route.meta.parentName,
                { docItems: newData, total: totalValue },
                fsDocument.id,
            );

            fsDocument.docItems = newData;
            fsDocument.total = totalValue;
            openModal(null);
        } catch (error) {
            errMsg.value = firebaseError(error.code);
            console.log(error);
        }
    }

    async function addDocItem(item) {
        item["createdAt"] = new Date();
        updateDocItems([...fsDocument.docItems, item]);
    }

    async function editDocItem(item, idx) {
        updateDocItems([...fsDocument.docItems].toSpliced(idx, 1, item));
    }

    async function delDocItem(idx) {
        updateDocItems([...fsDocument.docItems].toSpliced(idx, 1));
    }

    async function getClient(id) {
        try {
            return await readDocument("clients", id);
        } catch (error) {
            alert(firebaseError(error.code));
        }
    }

    watch(fsDocument, (doc) => {
        document.title = doc ? `${doc.name} · Bizmon` : "Bizmon";
    });

    onMounted(async () => {
        try {
            const document = await readDocument(
                route.meta.parentName,
                route.params.id,
            );

            Object.assign(fsDocument, document);

            const docIdx = userData.value
                ? userData.value.recentDocuments.findIndex(
                      (doc) => doc.docId === fsDocument.id,
                  )
                : 0;

            if (docIdx !== 0) {
                let newRecents = [
                    {
                        docId: fsDocument.id,
                        docName: fsDocument.name,
                        docType: route.meta.parentName,
                    },
                ];

                if (docIdx === -1) {
                    newRecents.push(
                        ...userData.value.recentDocuments.slice(0, 2),
                    );
                } else if (docIdx > 0) {
                    newRecents.push(
                        ...userData.value.recentDocuments.toSpliced(docIdx, 1),
                    );
                }

                updateDocument(
                    "users",
                    {
                        recentDocuments: newRecents,
                    },
                    loggedUser.value.uid,
                );

                userData.value.recentDocuments = newRecents;
            }

            allItems.value = await readCollection("items", "name", "asc");

            clientData.value = fsDocument.clientId
                ? await getClient(fsDocument.clientId)
                : { name: fsDocument.clientName };
        } catch (error) {
            alert(firebaseError(error.code));
        }
        loading.value = false;

        if (!fsDocument) router.replace({ name: "not-found" });
    });
</script>

<template>
    <AppLayout
        :doc-title="fsDocument ? fsDocument.name : ''"
        @trigger-download="
            downloadPDF(fsDocument, route.meta.parentName, clientData)
        "
    >
        <!-- Prikaz stavaka -->
        <div class="py-6 px-8 flex flex-col gap-4 h-full min-h-0">
            <div
                class="flex-1 min-h-0 md:order-last flex flex-col gap-4 overflow-y-scroll scrollbar-none"
            >
                <!-- Obavijest o učitavanju elemenata -->
                <div
                    v-if="loading"
                    class="w-full h-screen text-mm-white flex gap-2 justify-center items-center"
                >
                    <LoaderCircle class="animate-spin" />
                    <span class="text-2xl"
                        >Učitavanje
                        <span class="animate-pulse">...</span>
                    </span>
                </div>

                <!-- Obavijest o nepostojanju elemenata -->
                <div
                    v-if="!loading && !fsDocument.docItems.length"
                    class="h-full text-mm-white flex flex-col justify-center items-center text-2xl"
                >
                    <span>Nema stavaka</span>
                    <span>za prikazivanje</span>
                </div>

                <!-- Učitavanje stavaka -->
                <CardBase
                    v-if="!loading && fsDocument"
                    v-for="(item, idx) in fsDocument.docItems"
                    :key="idx"
                >
                    <div class="separate-and-center">
                        <span class="text-mm-white text-xl font-medium">{{
                            item.name
                        }}</span>
                        <div class="flex gap-3">
                            <Pencil
                                @click="openModal('edit', idx)"
                                class="text-mm-neutral"
                            />
                            <Trash
                                @click="delDocItem(idx)"
                                class="text-mm-error"
                            />
                        </div>
                    </div>
                    <div class="separate-and-center font-semibold">
                        <span class="text-mm-muted">{{
                            `${item.amount} ${item.unit} × ${formatPrice(item.price)}`
                        }}</span>
                        <span class="text-mm-white text-lg">{{
                            formatPrice(item.price * item.amount)
                        }}</span>
                    </div>
                </CardBase>
            </div>

            <!-- Ukupno i dodavanje -->
            <div
                class="flex w-full md:order-first"
                :class="
                    fsDocument && fsDocument.docItems.length
                        ? 'gap-4 justify-between items-center'
                        : 'justify-end'
                "
            >
                <CardBase
                    v-if="fsDocument && fsDocument.docItems.length"
                    class="w-full border border-mm-gray"
                >
                    <div
                        class="flex justify-between items-center text-xl text-mm-white font-semibold"
                    >
                        <span>Ukupno:</span>
                        <span>{{ formatPrice(fsDocument.total) }}</span>
                    </div>
                </CardBase>

                <div
                    @click="openModal('add')"
                    class="bg-mm-primary p-1.5 rounded-full size-fit"
                >
                    <Plus class="size-11 text-mm-dark" />
                </div>
            </div>
        </div>

        <!-- Modal za unos i izmjenu stavaka -->
        <ModalBase
            v-if="['add', 'edit'].includes(activeModal)"
            @click="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
            :title="activeModal === 'edit' ? 'Uredi stavku' : 'Unos stavke'"
            @exit="
                activeModal === 'edit'
                    ? openModal('info', selected)
                    : openModal(null)
            "
        >
            <form
                @submit.prevent="
                    activeModal === 'edit'
                        ? formEdited &&
                          editDocItem({ ...docItemForm }, selected)
                        : formValid && addDocItem({ ...docItemForm })
                "
                class="main-container"
            >
                <div class="input-block-v">
                    <label for="name" class="input-label">STAVKA:</label>
                    <div id="name" class="relative">
                        <input
                            class="input-field w-full border border-transparent border-b-0 focus:outline-none"
                            :class="{
                                'rounded-b-none! border-mm-white!':
                                    showDropdown,
                            }"
                            placeholder="Pretraživanje klijenata..."
                            @focus="itemsDropOpen = true"
                            @blur="itemsDropOpen = false"
                            v-model="docItemForm.name"
                        />

                        <ul
                            v-if="showDropdown"
                            class="absolute w-full bg-mm-navy text-mm-white max-h-40 rounded-b-xl overflow-y-auto border border-mm-white border-t-0 z-10"
                        >
                            <li
                                v-for="(c, idx) in items"
                                class="mx-auto py-1 px-2"
                                @mousedown.prevent="selectClient(c)"
                                :key="idx"
                            >
                                {{ c.name }}
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="input-block-h">
                    <label for="price" class="input-label text-nowrap"
                        >JEDINIČNA CIJENA:</label
                    >
                    <div class="relative flex items-center">
                        <input
                            id="price"
                            type="number"
                            inputmode="numeric"
                            class="input-field w-full text-end max-w-22"
                            style="padding-right: 27px"
                            placeholder="0.0"
                            step="0.01"
                            required
                            @focus="$event.target.select()"
                            v-model.number="docItemForm.price"
                        />
                        <span class="text-mm-white text-lg absolute right-2.5"
                            >€</span
                        >
                    </div>
                </div>
                <div class="input-block-h">
                    <label for="unit" class="input-label text-nowrap"
                        >JEDINIČNA MJERA:</label
                    >
                    <div id="unit" class="relative w-full max-w-22">
                        <div
                            class="input-field flex justify-between items-center border border-transparent border-b-0 min-h-11 max-h-11"
                            :class="{
                                ' rounded-b-none! border-mm-white!':
                                    unitDropOpen,
                            }"
                            @click="unitDropOpen = !unitDropOpen"
                        >
                            <span>{{ docItemForm.unit }}</span>
                            <ChevronDown class="size-5" />
                        </div>

                        <ul
                            v-if="unitDropOpen"
                            class="absolute z-10 w-full bg-mm-navy text-mm-white rounded-b-xl max-h-21 overflow-y-auto border border-mm-white border-t-0"
                        >
                            <li
                                v-for="(option, idx) in units.filter(
                                    (item) => item != docItemForm.unit,
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
                <div class="input-block-h">
                    <label for="amount" class="input-label text-nowrap"
                        >UKUPNA KOLIČINA:</label
                    >
                    <input
                        id="amount"
                        type="number"
                        inputmode="numeric"
                        class="input-field w-full text-end max-w-22"
                        placeholder="0"
                        :step="validAmount"
                        min="1"
                        required
                        @focus="$event.target.select()"
                        v-model.number="docItemForm.amount"
                    />
                </div>
                <hr class="border-mm-gray border" />
                <div class="flex justify-center pt-3 relative">
                    <button
                        :disabled="
                            !formValid ||
                            (activeModal === 'edit' && !formEdited)
                        "
                        type="submit"
                        class="confirm-btn"
                    >
                        {{
                            activeModal === "edit"
                                ? "UREDI STAVKU"
                                : "UNESI STAVKU"
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
    </AppLayout>
</template>
