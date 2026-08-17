<script setup>
    import routesData from "@/data/routesData";
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
        <div class="flex justify-between items-center px-1">
            <span class="input-label">CIJENA:</span>
            <span class="text-lg">{{
                selected.price + " €/" + selected.unit
            }}</span>
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
