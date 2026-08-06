<script setup>
    import routesData from "@/data/routesData";
    import { readCollection } from "@/firebase";
    import { ChevronDown } from "@lucide/vue";
    import { serverTimestamp } from "firebase/firestore";
    import { computed, onMounted, reactive, ref } from "vue";
    import { useRoute } from "vue-router";

    const route = useRoute();

    const props = defineProps({
        errMsg: String,
        isEdit: Boolean,
        selected: Object,
    });
    const emit = defineEmits(["add", "edit"]);

    const documentsForm = reactive({
        name: null,
        clientName: "",
        clientId: null,
        description: null,
    });

    const statusDropOpen = ref(false);
    const statuses = routesData[route.name].status;

    function selectStatus(status) {
        documentsForm.status = status;
        statusDropOpen.value = false;
    }

    const clientDropOpen = ref(false);
    const allClients = ref([]);
    const clients = computed(() =>
        allClients.value.filter(
            (c) =>
                c.name
                    .toLowerCase()
                    .includes(documentsForm.clientName.toLowerCase()) &&
                c.name !== documentsForm.clientName,
        ),
    );

    const showDropdown = computed(
        () => clientDropOpen.value && clients.value.length,
    );

    function selectClient(client) {
        documentsForm.clientId = client.id;
        documentsForm.clientName = client.name;
        clientDropOpen.value = false;
        document.activeElement.blur();
    }

    const formValid = computed(() =>
        Boolean(documentsForm.name && documentsForm.clientName),
    );

    const clientValid = computed(() =>
        Boolean(
            allClients.value.find(
                (c) =>
                    c.id === documentsForm.clientId &&
                    c.name === documentsForm.clientName,
            ),
        ),
    );

    const formEdited = computed(
        () =>
            props.isEdit &&
            Object.keys(documentsForm).some(
                (key) => documentsForm[key] !== props.selected[key],
            ),
    );

    onMounted(async () => {
        if (props.isEdit && props.selected)
            Object.assign(documentsForm, props.selected);

        allClients.value = await readCollection("clients", "name", "asc");
    });
</script>

<template>
    <form
        @submit.prevent="
            isEdit
                ? formEdited && emit('edit', { ...documentsForm })
                : formValid &&
                  emit(
                      'add',
                      Object.assign(
                          { ...documentsForm },
                          {
                              status: Object.keys(
                                  routesData[route.name].status,
                              )[0],
                              createdAt: serverTimestamp(),
                              total: 0.0,
                          },
                      ),
                  )
        "
        class="main-container"
    >
        <div v-if="isEdit" class="input-block-h">
            <label for="status" class="input-label">STATUS:</label>
            <div id="status" class="relative w-40">
                <div
                    class="input-field flex justify-between items-center border border-transparent border-b-0"
                    :class="{
                        ' rounded-b-none! border-mm-white!': statusDropOpen,
                    }"
                    @click="statusDropOpen = !statusDropOpen"
                >
                    <span
                        :class="`text-mm-${statuses[documentsForm.status]}`"
                        >{{ documentsForm.status }}</span
                    >
                    <ChevronDown class="size-5" />
                </div>

                <ul
                    v-if="statusDropOpen"
                    class="absolute w-full bg-mm-navy text-mm-white rounded-b-xl max-h-40 overflow-y-auto border border-mm-white border-t-0"
                >
                    <li
                        v-for="(option, idx) in Object.keys(statuses).filter(
                            (item) => item != documentsForm.status,
                        )"
                        class="mx-auto py-1 px-2 text-lg"
                        :class="`text-mm-${statuses[option]}`"
                        @click="selectStatus(option)"
                        :key="idx"
                    >
                        {{ option }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="input-block-v">
            <label for="name" class="input-label">NAZIV/OZNAKA:</label>
            <input
                id="name"
                type="text"
                class="input-field"
                placeholder="npr. 'Kuća Test' ili 'DOC-001'"
                autocomplete="off"
                required
                v-model="documentsForm.name"
            />
        </div>
        <div class="input-block-v">
            <label for="client" class="input-label text-nowrap">KLIJENT:</label>
            <div id="client" class="relative">
                <input
                    class="input-field w-full border border-transparent border-b-0 focus:outline-none"
                    :class="{
                        'rounded-b-none! border-mm-white!': showDropdown,
                    }"
                    placeholder="Pretraživanje klijenata..."
                    @focus="clientDropOpen = true"
                    @blur="clientDropOpen = false"
                    v-model="documentsForm.clientName"
                />

                <ul
                    v-if="showDropdown"
                    class="absolute w-full bg-mm-navy text-mm-white max-h-40 rounded-b-xl overflow-y-auto border border-mm-white border-t-0 z-10"
                >
                    <li
                        v-for="(c, idx) in clients"
                        class="mx-auto py-1 px-2"
                        @mousedown.prevent="selectClient(c)"
                        :key="idx"
                    >
                        {{ c.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="input-block-v">
            <label for="desc" class="input-label">OPIS:</label>
            <textarea
                id="desc"
                class="input-field"
                rows="3"
                placeholder="npr. Servis računala na lokaciji..."
                v-model="documentsForm.description"
            ></textarea>
        </div>
        <hr class="border-mm-gray border" />
        <div class="flex justify-center pt-3 relative">
            <button
                :disabled="
                    !formValid || !clientValid || (isEdit && !formEdited)
                "
                type="submit"
                class="confirm-btn"
            >
                {{ isEdit ? "UREDI ARTIKL" : "UNESI ARTIKL" }}
            </button>
            <span
                v-if="errMsg"
                class="absolute bottom-10 text-mm-error text-sm"
                >{{ errMsg }}</span
            >
        </div>
    </form>
</template>
