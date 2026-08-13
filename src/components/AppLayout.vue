<script setup>
    import doctypesData from "@/data/doctypesData";
    import firebaseError from "@/data/errorsData";
    import { auth } from "@/firebase";
    import { downloadPDF } from "@/utils/downloadPDF";
    import {
        ArrowLeft,
        Component,
        Download,
        LogOut,
        Menu,
        User,
    } from "@lucide/vue";
    import { signOut } from "firebase/auth";
    import { ref } from "vue";
    import { useRoute, useRouter } from "vue-router";

    const router = useRouter();
    const route = useRoute();
    defineProps({
        infoActive: Boolean,
        docTitle: String,
        downloadData: Array,
    });

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
    <div class="h-dvh flex flex-col bg-mm-dark">
        <!-- Header za smartphone -->
        <div
            class="relative bg-mm-navy h-20 flex items-center justify-between gap-3 px-6"
        >
            <RouterLink
                v-if="route.params.id"
                :to="{ name: route.meta.parentName }"
            >
                <ArrowLeft class="header-icon" />
            </RouterLink>
            <span
                v-if="route.name === 'dashboard'"
                class="text-5xl font-extrabold"
                @click="console.log(auth.currentUser)"
            >
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </span>
            <span
                v-else
                class="text-mm-white font-medium truncate"
                :class="route.params.id ? 'text-2xl' : 'text-4xl'"
            >
                {{
                    route.params.id
                        ? docTitle
                        : doctypesData.find((x) => x.path === route.path).label
                }}
            </span>
            <div class="flex items-center gap-1">
                <User
                    v-if="route.name === 'dashboard'"
                    class="header-icon"
                    :class="{
                        'icon-active': infoActive,
                    }"
                    @click="
                        $emit('openInfo');
                        openMenu = false;
                    "
                />
                <Download
                    v-if="route.params.id"
                    class="header-icon text-mm-success!"
                    @click="downloadPDF(...downloadData)"
                />
                <Menu
                    v-else
                    class="header-icon"
                    @click="openMenu = !openMenu"
                    :class="{
                        'icon-active': openMenu,
                    }"
                />
            </div>
        </div>

        <!-- Menu headera -->
        <div v-if="openMenu">
            <div
                class="absolute z-10 w-full bg-mm-navy flex border-t border-b shadow-xl shadow-mm-dark border-mm-gray text-mm-white text-xl py-2"
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

        <!-- Slot za sadržaj -->
        <main class="flex-1 overflow-y-auto">
            <slot />
        </main>

        <!-- Navbar za smartphone -->
        <nav class="h-20 bg-mm-navy flex justify-around items-center">
            <router-link
                v-for="(item, idx) in doctypesData.filter((i) => !i.menuItem)"
                :to="item.path"
                class="text-mm-gray size-16.5 rounded-xl"
                :class="[
                    {
                        'bg-mm-lightnavy text-mm-primary':
                            item.path === $route.path,
                    },
                    {
                        'text-mm-primary':
                            item.path.slice(1) === $route.meta.parentName,
                    },
                ]"
                :key="idx"
            >
                <div class="h-full flex flex-col items-center justify-center">
                    <component :is="item.icon" class="size-10 stroke-[1.5]" />
                    <span class="text-xs">{{ item.label }}</span>
                </div>
            </router-link>
        </nav>
    </div>
</template>

<style scoped>
    @reference '@/assets/main.css';

    .header-icon {
        @apply size-11 text-mm-gray p-1.5;
    }

    .icon-active {
        @apply text-mm-primary bg-mm-lightnavy rounded-lg;
    }
</style>
