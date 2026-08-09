<script setup>
    defineProps({
        routeTo: {
            type: String,
            default: "",
        },
    });
</script>

<template>
    <RouterLink :to="routeTo" class="bg-mm-lightnavy rounded-2xl p-4">
        <div class="flex flex-col gap-2">
            <slot />
        </div>
    </RouterLink>
</template>
