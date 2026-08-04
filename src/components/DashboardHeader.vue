<script setup>
    import doctypesData from "@/data/doctypesData";
    import firebaseError from "@/data/errorsData";
    import { auth } from "@/firebase";
    import { Component, LogOut, Menu, User } from "@lucide/vue";
    import { signOut } from "firebase/auth";
    import { ref } from "vue";
    import { useRoute, useRouter } from "vue-router";

    const router = useRouter();
    const route = useRoute();
    defineProps(["infoActive"]);

    const openMenu = ref(false);

    const logoutField = {
        icon: LogOut,
        label: "Odjava",
    };

    async function logOut() {
        try {
            await signOut(auth);
            router.push("/login");
        } catch (error) {
            alert(firebaseError(error.code));
        }
    }
</script>

<template>
    <div>
        <div class="h-20 bg-mm-navy flex items-center justify-between px-6">
            <span
                v-if="route.name === 'dashboard'"
                class="text-5xl font-extrabold"
                @click="console.log(auth.currentUser)"
            >
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </span>
            <span v-else class="text-mm-white text-4xl font-medium">
                {{ doctypesData.find((x) => x.path === route.path).label }}
            </span>
            <div class="flex items-center gap-1">
                <User
                    v-if="route.name === 'dashboard'"
                    class="size-11 text-mm-gray p-1.5"
                    :class="{
                        'text-mm-primary bg-mm-lightnavy rounded-lg':
                            infoActive,
                    }"
                    @click="
                        $emit('openInfo');
                        openMenu = false;
                    "
                />
                <Menu
                    class="size-11 text-mm-gray p-1.5"
                    @click="openMenu = !openMenu"
                    :class="{
                        'text-mm-primary bg-mm-lightnavy rounded-lg': openMenu,
                    }"
                />
            </div>
        </div>
        <div v-if="openMenu">
            <div
                class="flex border-t border-b shadow-xl shadow-mm-dark border-mm-gray bg-mm-navy text-mm-white text-xl py-2"
            >
                <component
                    v-for="(item, idx) in doctypesData
                        .filter((i) => i.menuItem)
                        .concat(logoutField)"
                    :is="item.path ? 'router-link' : 'button'"
                    :to="item.path"
                    @click="item.path ? (openMenu = false) : logOut()"
                    class="flex gap-2 items-center w-1/3 py-1 not-first:border-l not-first:border-mm-gray justify-center"
                    :key="idx"
                >
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                </component>
            </div>
        </div>
    </div>
</template>
