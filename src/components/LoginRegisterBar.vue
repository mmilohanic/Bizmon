<script setup>
    import { LogIn, UserPlus } from "@lucide/vue";
    import { ref } from "vue";

    const logRegData = ref([
        {
            icon: LogIn,
            label: "PRIJAVA",
            route: "login",
        },
        {
            icon: UserPlus,
            label: "REGISTRACIJA",
            route: "register",
        },
    ]);
</script>

<template>
    <div class="h-25 px-8 py-6 bg-mm-navy flex">
        <div
            v-for="item in logRegData"
            @click="$router.push('/' + item.route)"
            class="flex flex-col items-center justify-center w-1/2 text-mm-gray rounded-xl text-sm font-extrabold tracking-wide"
            :class="{
                'text-mm-primary bg-mm-lightnavy': $route.name == item.route,
            }"
        >
            <component :is="item.icon" />
            <span>{{ item.label }}</span>
        </div>
    </div>
</template>
