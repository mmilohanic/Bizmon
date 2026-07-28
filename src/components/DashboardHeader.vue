<script setup>
    import firebaseError from "@/data/errorsData";
    import { auth } from "@/firebase";
    import {
        Handshake,
        LogOut,
        Menu,
        StretchHorizontal,
        User,
    } from "@lucide/vue";
    import { signOut } from "firebase/auth";
    import { ref } from "vue";
    import { useRouter } from "vue-router";

    const router = useRouter();

    const openInfo = ref(false);
    const openMenu = ref(false);

    const menuItems = [
        {
            icon: StretchHorizontal,
            label: "Stavke",
            path: "/stavke",
        },
        {
            icon: Handshake,
            label: "Klijenti",
            path: "/klijenti",
        },
        {
            icon: LogOut,
            label: "Odjava",
        },
    ];

    async function makeAction(item) {
        try {
            if (item.label === "Odjava") {
                await signOut(auth);
                router.push("/login");
            } else {
                router.push(item.path);
            }
        } catch (error) {
            errorMessage.value = firebaseError(error.code);
        } finally {
            openMenu.value = false;
        }
    }
</script>

<template>
    <div>
        <div
            class="h-20 bg-mm-navy flex items-center justify-between px-6 z-50"
        >
            <span class="text-5xl font-extrabold">
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </span>
            <div class="flex items-center gap-1">
                <User
                    class="size-11 text-mm-gray p-1.5"
                    :class="{
                        'text-mm-primary bg-mm-lightnavy rounded-lg': openInfo,
                    }"
                    @click="
                        openInfo = !openInfo;
                        openMenu = false;
                    "
                />
                <Menu
                    class="size-11 text-mm-gray p-1.5"
                    @click="
                        openMenu = !openMenu;
                        openInfo = false;
                    "
                    :class="{
                        'text-mm-primary bg-mm-lightnavy rounded-lg': openMenu,
                    }"
                />
            </div>
        </div>
        <div
            v-if="openMenu"
            class="flex border-t border-b border-mm-gray bg-mm-navy text-mm-white text-xl py-2"
        >
            <div
                v-for="(item, idx) in menuItems"
                @click="makeAction(item)"
                class="flex gap-2 items-center w-1/3 py-1 not-first:border-l not-first:border-mm-gray justify-center"
                :key="idx"
            >
                <component :is="item.icon" />
                <span>{{ item.label }}</span>
            </div>
        </div>
        <div
            v-if="openMenu"
            class="h-screen backdrop-blur-sm z-40"
            @click="openMenu = false"
        ></div>
    </div>
</template>
