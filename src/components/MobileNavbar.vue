<script setup>
    defineProps(["navItems"]);
</script>

<template>
    <div class="h-20 bg-mm-navy flex justify-around items-center">
        <div
            v-for="(item,, idx) in $props.navItems"
            class="text-mm-gray size-16.5"
            :class="{
                'bg-mm-lightnavy text-mm-primary rounded-xl':
                    item.label.toLowerCase() == $route.name,
            }"
            :key="idx"
        >
            <div class="h-full flex flex-col items-center justify-center">
                <component :is="item.icon" class="size-10 stroke-[1.5]" />
                <span class="text-xs">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
