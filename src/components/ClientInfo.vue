<script setup>
    import { ref } from "vue";

    const props = defineProps({
        selected: Object,
    });
    const emit = defineEmits(["edit", "delete"]);
    const delAttempt = ref(false);
    const errMsg = defineModel("errMsg");
</script>

<template>
    <div class="main-container">
        <div class="info-block">
            <span class="input-label">OIB:</span>
            <span class="text-lg">{{ selected.oib }}</span>
        </div>
        <div class="info-block">
            <span class="input-label">TELEFON:</span>
            <span class="text-lg">{{ selected.phone ?? "/" }}</span>
        </div>
        <div class="info-block">
            <span class="input-label">E-MAIL:</span>
            <div
                v-if="selected.email && selected.email.length > 18"
                class="flex flex-col items-end"
            >
                <span class="text-lg">{{
                    selected.email.slice(0, selected.email.indexOf("@"))
                }}</span>
                <span class="text-lg">{{
                    selected.email.slice(selected.email.indexOf("@"))
                }}</span>
            </div>
            <span v-else>{{ selected.email ?? "/" }}</span>
        </div>
        <div class="info-block">
            <span class="input-label">ADRESA:</span>
            <span class="text-lg">{{
                selected.street + " " + selected.street_num
            }}</span>
        </div>
        <div class="info-block">
            <span class="input-label">MJESTO:</span>
            <span class="text-lg">{{
                selected.town + ", " + selected.zip
            }}</span>
        </div>
        <div class="info-block">
            <span class="input-label">DRŽAVA:</span>
            <span class="text-lg">{{ selected.country }}</span>
        </div>

        <hr class="border-mm-gray border" />
        <div class="flex justify-center px-1 relative pt-3">
            <div class="flex gap-4 justify-between w-full">
                <button
                    @click="emit('edit')"
                    class="text-mm-primary font-bold py-1.5 border rounded-lg w-1/2"
                >
                    Uredi klijenta
                </button>
                <button
                    @click="
                        delAttempt
                            ? (emit('delete'), (delAttempt = false))
                            : ((errMsg = null), (delAttempt = true))
                    "
                    class="rounded-lg py-1.5 w-1/2"
                    :class="
                        delAttempt
                            ? 'bg-mm-error/80 text-mm-lightnavy font-extrabold tracking-wider'
                            : 'border border-mm-error text-mm-error font-bold'
                    "
                >
                    Obriši klijenta
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
</template>

<style scoped>
    @reference "@/assets/main.css";

    .info-block {
        @apply flex justify-between items-center px-1;
    }
</style>
