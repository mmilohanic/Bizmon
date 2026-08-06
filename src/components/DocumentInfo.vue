<script setup>
    import routesData from "@/data/routesData";
    import { ref } from "vue";
    import { useRoute } from "vue-router";

    const route = useRoute();
    const props = defineProps({
        selected: Object,
    });
    const emit = defineEmits(["edit", "delete"]);
    const delAttempt = ref(false);
    const errMsg = defineModel("errMsg");

    function statusStyle(status) {
        const color = routesData[route.name].status[status];
        return `border-mm-${color} text-mm-${color}`;
    }
</script>

<template>
    <div class="main-container">
        <div class="separate-and-center">
            <span class="input-label">STATUS:</span>
            <span
                class="border rounded-full px-2"
                :class="statusStyle(selected.status)"
                >{{ selected.status }}</span
            >
        </div>
        <div class="separate-and-center">
            <span class="input-label">KREIRANO:</span>
            <span class="info-text">{{
                selected.createdAt.toDate().toLocaleDateString("hr-HR")
            }}</span>
        </div>
        <div class="separate-and-center">
            <span class="input-label">VRIJEDNOST:</span>
            <span class="info-text"
                >{{ Number(selected.total).toFixed(2) }} €</span
            >
        </div>
        <div class="flex flex-col gap-2 px-1">
            <span class="input-label">KLIJENT:</span>
            <span class="ps-4 text-lg">{{ selected.clientName }}</span>
        </div>
        <div
            class="flex px-1"
            :class="
                selected.description && selected.description.length > 18
                    ? 'flex-col gap-2'
                    : 'justify-between'
            "
        >
            <span class="input-label">OPIS:</span>
            <span class="ps-4 text-lg">{{
                selected.description ?? "Nema opisa"
            }}</span>
        </div>
        <hr class="border-mm-gray border" />
        <div class="flex justify-center px-1 relative pt-3">
            <div class="flex gap-4 justify-between w-full">
                <button
                    @click="emit('edit')"
                    class="text-mm-primary font-bold py-1.5 border rounded-lg w-1/2"
                >
                    Uredi artikl
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
                    Obriši artikl
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
        @apply text-lg text-right;
    }
</style>
