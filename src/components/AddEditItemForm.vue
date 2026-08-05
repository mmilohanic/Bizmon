<script setup>
    import { ChevronDown } from "@lucide/vue";
    import { computed, onMounted, reactive, ref } from "vue";

    const props = defineProps({
        errMsg: String,
        isEdit: Boolean,
        selected: Object,
    });
    const emit = defineEmits(["add", "edit"]);

    const itemsForm = reactive({
        name: null,
        price: null,
        unit: null,
        description: null,
    });

    const units = ["kom", "kpl", "sat", "m", "m²", "m³", "kg", "l"];
    const dropdownOpen = ref(false);

    function select(option) {
        itemsForm.unit = option;
        dropdownOpen.value = false;
    }

    const formValid = computed(() =>
        Boolean(itemsForm.name && itemsForm.price && itemsForm.unit),
    );

    const formEdited = computed(
        () =>
            props.isEdit &&
            Object.keys(itemsForm).some(
                (key) => itemsForm[key] !== props.selected[key],
            ),
    );

    onMounted(() => {
        if (props.isEdit && props.selected)
            Object.keys(itemsForm).map(
                (key) => (itemsForm[key] = props.selected[key]),
            );
    });
</script>

<template>
    <form
        @submit.prevent="
            isEdit
                ? formEdited && emit('edit', { ...itemsForm })
                : formValid && emit('add', { ...itemsForm })
        "
        class="main-container"
    >
        <div class="input-block-v">
            <label for="name" class="input-label">NAZIV ARTIKLA:</label>
            <input
                id="name"
                type="text"
                class="input-field"
                placeholder="npr. Prijenosno računalo"
                autocomplete="off"
                required
                v-model="itemsForm.name"
            />
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
                    v-model.number="itemsForm.price"
                />
                <span class="text-mm-white text-lg absolute right-2.5">€</span>
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
                        ' rounded-b-none! border-mm-white!': dropdownOpen,
                    }"
                    @click="dropdownOpen = !dropdownOpen"
                >
                    <span>{{ itemsForm.unit }}</span>
                    <ChevronDown class="size-5" />
                </div>

                <ul
                    v-if="dropdownOpen"
                    class="absolute w-full bg-mm-navy text-mm-white rounded-b-xl max-h-40 overflow-y-auto border border-mm-white border-t-0"
                >
                    <li
                        v-for="(option, idx) in units.filter(
                            (item) => item != itemsForm.unit,
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
        <div class="input-block-v">
            <label for="desc" class="input-label">OPIS ARTIKLA:</label>
            <textarea
                id="desc"
                class="input-field"
                rows="3"
                placeholder='npr. Dell 15.6" FHD IPS 120hZ...'
                v-model="itemsForm.description"
            ></textarea>
        </div>
        <hr class="border-mm-gray border" />
        <div class="flex justify-center pt-3 relative">
            <button
                :disabled="!formValid || (isEdit && !formEdited)"
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
