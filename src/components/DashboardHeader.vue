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
    defineProps(["infoActive"]);

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
                class="text-5xl font-extrabold"
                @click="console.log(auth.currentUser)"
            >
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </span>
            <div class="flex items-center gap-1">
                <User
                    class="size-11 text-mm-gray p-1.5"
                    :class="{
                        'text-mm-primary bg-mm-lightnavy rounded-lg':
                            $props.infoActive,
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
                    v-for="(item, idx) in menuItems"
                    :is="item.path ? 'router-link' : 'button'"
                    :to="item.path"
                    @click="item.path ?? logOut()"
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
