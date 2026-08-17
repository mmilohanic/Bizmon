<script setup>
    import routesData from "@/data/routesData";
    import { Copy } from "@lucide/vue";
    import { ref } from "vue";

    const props = defineProps({
        selected: Object,
    });
    const emit = defineEmits(["edit", "delete"]);
    const delAttempt = ref(false);
    const errMsg = defineModel("errMsg");

    function copy(text) {
        navigator.clipboard.writeText(text);
    }
</script>

<template>
    <div class="main-container">
        <div class="separate-and-center">
            <span class="input-label">OIB:</span>
            <span class="info-text">{{ selected.oib }}</span>
        </div>
        <div class="separate-and-center">
            <span class="input-label">TELEFON:</span>
            <span class="info-text">{{ selected.phone ?? "/" }}</span>
        </div>
        <div class="separate-and-center">
            <div class="flex gap-2">
                <span class="input-label">E-MAIL:</span>
                <button @click="copy(selected.email)">
                    <Copy class="size-5" />
                </button>
            </div>
            <span v-if="!selected.email">/</span>
            <div v-else class="flex flex-col underline">
                <a
                    :href="`mailto:${selected.email}`"
                    class="info-text truncate"
                    >{{
                        selected.email.length > 15
                            ? selected.email.slice(
                                  0,
                                  selected.email.indexOf("@"),
                              )
                            : selected.email
                    }}</a
                ><span
                    v-if="selected.email.length > 15"
                    class="info-text truncate"
                    >{{
                        selected.email.slice(selected.email.indexOf("@"))
                    }}</span
                >
            </div>
        </div>
        <div class="separate-and-center">
            <span class="input-label">ADRESA:</span>
            <span class="info-text">{{
                selected.street + " " + selected.street_num
            }}</span>
        </div>
        <div class="separate-and-center">
            <span class="input-label">MJESTO:</span>
            <span class="info-text">{{
                selected.town + ", " + selected.zip
            }}</span>
        </div>
        <div class="separate-and-center">
            <span class="input-label">DRŽAVA:</span>
            <span class="info-text">{{ selected.country }}</span>
        </div>

        <hr class="border-mm-gray border" />
        <div class="flex justify-center px-1 relative pt-3">
            <div class="flex gap-4 justify-between w-full">
                <button
                    @click="emit('edit')"
                    class="text-mm-primary font-bold py-1.5 border rounded-lg w-1/2"
                >
                    {{ routesData[$route.name].modalLabels.edit }}
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
                    {{ routesData[$route.name].modalLabels.delete }}
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

    .separate-and-center {
        @apply gap-5;
    }

    .input-label {
        @apply text-nowrap;
    }

    .info-text {
        @apply text-lg text-right line-clamp-2 max-w-40;
    }
</style>
