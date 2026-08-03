<script setup>
    import { X } from "@lucide/vue";

    const props = defineProps({
        title: String,
        hideTitle: {
            type: Boolean,
            default: false,
        },
    });
</script>

<template>
    <div
        class="bg-mm-dark/80 z-20 flex items-center justify-center px-8 fixed inset-0"
    >
        <div
            @click.stop
            class="bg-mm-lightnavy border border-mm-gray rounded-2xl p-6 text-mm-white w-full"
        >
            <div v-if="!props.hideTitle">
                <div class="flex justify-between items-center">
                    <span
                        class="text-2xl text-mm-white font-bold tracking-wide"
                        >{{ $props.title }}</span
                    >
                    <X class="size-8" @click="$emit('exit')" />
                </div>
                <hr class="border-mm-gray border my-4" />
            </div>
            <slot />
        </div>
    </div>
</template>
