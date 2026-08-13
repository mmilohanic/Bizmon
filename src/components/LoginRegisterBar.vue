<script setup>
    import { LogIn, UserPlus } from "@lucide/vue";
    import { ref } from "vue";

    const logRegData = ref([
        {
            icon: LogIn,
            label: "PRIJAVA",
            route: "/login",
        },
        {
            icon: UserPlus,
            label: "REGISTRACIJA",
            route: "/register",
        },
    ]);
</script>

<template>
    <div class="h-25 min-h-25 max-h-25 px-8 py-6 bg-mm-navy flex">
        <router-link
            v-for="item in logRegData"
            :to="item.route"
            class="flex flex-col items-center justify-center w-1/2 text-mm-gray rounded-xl text-sm font-extrabold tracking-wide"
            :class="{
                'text-mm-primary bg-mm-lightnavy': $route.path == item.route,
            }"
        >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
        </router-link>
    </div>
</template>
