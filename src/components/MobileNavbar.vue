<script setup>
    import doctypesData from "@/data/doctypesData";
</script>

<template>
    <div class="h-20 bg-mm-navy flex justify-around items-center">
        <router-link
            v-for="(item, idx) in doctypesData.filter((i) => !i.menuItem)"
            :to="item.path"
            class="text-mm-gray size-16.5"
            :class="{
                'bg-mm-lightnavy text-mm-primary rounded-xl':
                    item.path == $route.path,
            }"
            :key="idx"
        >
            <div class="h-full flex flex-col items-center justify-center">
                <component :is="item.icon" class="size-10 stroke-[1.5]" />
                <span class="text-xs">{{ item.label }}</span>
            </div>
        </router-link>
    </div>
</template>
