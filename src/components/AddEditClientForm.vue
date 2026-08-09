<script setup>
    import { computed, onMounted, reactive, ref } from "vue";

    const props = defineProps({
        errMsg: String,
        isEdit: Boolean,
        selected: Object,
    });
    const emit = defineEmits(["add", "edit"]);

    const OIBerr = ref(null);

    const clientsForm = reactive({
        name: null,
        oib: null,
        phone: null,
        email: null,
        street: null,
        street_num: null,
        zip: null,
        town: null,
        country: "Hrvatska",
    });

    const formValid = computed(() =>
        Boolean(
            clientsForm.name &&
            clientsForm.oib &&
            clientsForm.street &&
            clientsForm.street_num &&
            clientsForm.zip &&
            clientsForm.town &&
            clientsForm.country,
        ),
    );

    const formEdited = computed(
        () =>
            props.isEdit &&
            Object.keys(clientsForm).some(
                (key) => clientsForm[key] !== props.selected[key],
            ),
    );

    const validOIB = computed(() => {
        const oib = clientsForm.oib;
        let a = 10;

        for (const ch of oib.slice(0, 10)) {
            a = (a + Number(ch)) % 10 || 10;
            a = (a * 2) % 11;
        }

        return (11 - a) % 10 === Number(oib[10]);
    });

    onMounted(() => {
        if (props.isEdit && props.selected)
            Object.assign(clientsForm, props.selected);
    });
</script>

<template>
    <form
        @submit.prevent="
            isEdit
                ? formEdited && emit('edit', { ...clientsForm })
                : formValid && emit('add', { ...clientsForm })
        "
        class="main-container"
    >
        <div class="input-block-v">
            <label for="name" class="input-label">IME I PREZIME/NAZIV:</label>
            <input
                id="name"
                type="text"
                class="input-field max-w-full!"
                placeholder="npr. Tvrtka d.o.o."
                autocomplete="off"
                required
                v-model="clientsForm.name"
            />
        </div>
        <div class="input-block-h">
            <label for="oib" class="input-label">OIB:</label>
            <input
                id="oib"
                type="text"
                inputmode="numeric"
                class="input-field"
                placeholder="npr. 01234567890"
                pattern="\d{11}"
                title="OIB mora imati 11 znamenki"
                maxlength="11"
                autocomplete="off"
                required
                @focus="OIBerr = null"
                @blur="if (!validOIB) OIBerr = 'Uneseni OIB nije ispravan';"
                v-model="clientsForm.oib"
            />
        </div>
        <div class="input-block-h gap-4">
            <label for="phone" class="input-label">TELEFON:</label>
            <input
                id="phone"
                type="text"
                inputmode="tel"
                class="input-field"
                placeholder="npr. 0912345678"
                autocomplete="off"
                v-model="clientsForm.phone"
            />
        </div>
        <div class="input-block-h">
            <label for="email" class="input-label">E-MAIL:</label>
            <input
                id="email"
                type="text"
                inputmode="email"
                class="input-field"
                placeholder="npr. test@mail.com"
                autocomplete="off"
                v-model="clientsForm.email"
            />
        </div>
        <div class="input-block-h">
            <label for="street" class="input-label">ULICA:</label>
            <input
                id="street"
                type="text"
                class="input-field"
                placeholder="npr. Ulica 1. maja"
                autocomplete="off"
                required
                v-model="clientsForm.street"
            />
        </div>
        <div class="input-block-h">
            <label for="street_num" class="input-label">KUĆNI BROJ:</label>
            <input
                id="street_num"
                type="text"
                class="input-field"
                placeholder="npr. 35A"
                autocomplete="off"
                required
                v-model="clientsForm.street_num"
            />
        </div>
        <div class="input-block-h">
            <label for="zip" class="input-label">ZIP:</label>
            <input
                id="street_num"
                type="number"
                inputmode="numeric"
                class="input-field"
                placeholder="npr. 52000"
                autocomplete="off"
                required
                v-model="clientsForm.zip"
            />
        </div>
        <div class="input-block-h">
            <label for="town" class="input-label">GRAD:</label>
            <input
                id="town"
                type="text"
                class="input-field"
                placeholder="npr. Zagreb"
                autocomplete="off"
                required
                v-model="clientsForm.town"
            />
        </div>
        <div class="input-block-h">
            <label for="country" class="input-label">DRŽAVA:</label>
            <input
                id="country"
                type="text"
                class="input-field"
                placeholder="npr. Hrvatska"
                autocomplete="off"
                required
                v-model="clientsForm.country"
            />
        </div>
        <hr class="border-mm-gray border" />
        <div class="flex justify-center pt-3 relative">
            <button
                :disabled="
                    !formValid ||
                    (!isEdit && !validOIB) ||
                    (isEdit && !formEdited)
                "
                type="submit"
                class="confirm-btn"
            >
                {{ isEdit ? "UREDI KLIJENTA" : "UNESI KLIJENTA" }}
            </button>
            <span
                v-if="errMsg || OIBerr"
                class="absolute bottom-10 text-mm-error text-sm"
                >{{ errMsg ? errMsg : OIBerr }}</span
            >
        </div>
    </form>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .input-block-h {
        @apply gap-4;
    }

    .input-label {
        @apply text-nowrap;
    }

    .input-field {
        @apply w-full max-w-13/20;
    }
</style>
