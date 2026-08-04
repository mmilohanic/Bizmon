<script setup>
    import { ChevronDown } from "@lucide/vue";
    import { computed, ref } from "vue";

    const props = defineProps({
        errMsg: String,
        formValues: Object,
        isEdit: Boolean,
        selected: Object,
    });
    const emit = defineEmits(["add", "edit"]);

    const units = ["kom", "kpl", "sat", "m", "m²", "m³", "kg", "l"];
    const dropdownOpen = ref(false);

    function select(option) {
        props.formValues.unit = option;
        dropdownOpen.value = false;
    }

    const formValid = computed(() =>
        Boolean(
            props.formValues.name &&
            props.formValues.price &&
            props.formValues.unit,
        ),
    );

    const formEdited = computed(
        () =>
            props.isEdit &&
            Object.keys(props.formValues).some(
                (key) => props.formValues[key] !== props.selected[key],
            ),
    );
</script>

<template>
    <form
        @submit.prevent="
            isEdit ? formEdited && emit('edit') : formValid && emit('add')
        "
        class="main-container"
    >
        <div class="input-block-v">
            <label for="add-name" class="input-label">NAZIV ARTIKLA:</label>
            <input
                id="add-name"
                type="text"
                class="input-field"
                placeholder="npr. Prijenosno računalo"
                autocomplete="off"
                v-model="formValues.name"
            />
        </div>
        <div class="input-block-h">
            <label for="add-price" class="input-label text-nowrap"
                >JEDINIČNA CIJENA:</label
            >
            <div class="relative flex items-center">
                <input
                    id="add-price"
                    type="number"
                    class="input-field w-full text-end max-w-22"
                    style="padding-right: 27px"
                    placeholder="0.0"
                    step="0.01"
                    v-model.number="formValues.price"
                />
                <span class="text-mm-white text-lg absolute right-2.5">€</span>
            </div>
        </div>
        <div class="input-block-h">
            <label for="add-unit" class="input-label text-nowrap"
                >JEDINIČNA MJERA:</label
            >
            <div id="add-unit" class="relative w-full max-w-22">
                <div
                    class="input-field flex justify-between items-center border border-transparent border-b-0 min-h-11 max-h-11"
                    :class="{
                        ' rounded-b-none! border-mm-white!': dropdownOpen,
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
        <div class="input-block-v">
            <label for="add-desc" class="input-label">OPIS ARTIKLA:</label>
            <textarea
                id="add-desc"
                class="input-field"
                rows="3"
                placeholder='npr. Dell 15.6" FHD IPS 120hZ...'
                v-model="formValues.description"
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
