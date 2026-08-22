<script setup>
    import doctypesData from "@/data/doctypesData";
    import firebaseError from "@/data/errorsData";
    import routesData from "@/data/routesData";
    import { auth } from "@/firebase";
    import {
        ArrowLeft,
        Component,
        Download,
        Funnel,
        LogOut,
        Menu,
        Search,
        User,
    } from "@lucide/vue";
    import { signOut } from "firebase/auth";
    import { ref } from "vue";
    import { useRoute, useRouter } from "vue-router";

    const router = useRouter();
    const route = useRoute();

    defineEmits(["openInfo", "openFilter", "triggerDownload"]);
    defineProps({
        infoActive: Boolean,
        filterOpened: Boolean,
        filterActive: Boolean,
        docTitle: String,
    });

    const hideHeader = defineModel("hideHeader", {
        type: Boolean,
        default: false,
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
    <!-- Smartphone -->
    <div class="md:hidden h-dvh flex flex-col bg-mm-dark">
        <!-- Header za smartphone -->
        <div
            v-if="!hideHeader"
            class="relative bg-mm-navy h-20 flex items-center justify-between gap-3 px-6 border-b border-mm-gray"
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
            >
                <span class="text-mm-white">BIZ</span>
                <span class="text-mm-primary">MON</span>
            </span>
            <span
                v-else
                class="text-mm-white font-medium line-clamp-2 text-center"
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
                <Funnel
                    v-if="
                        route.name in routesData &&
                        routesData[route.name].isDocument
                    "
                    class="header-icon"
                    :class="[
                        {
                            'text-mm-success!': filterActive && !filterOpened,
                        },
                        {
                            'icon-active': filterOpened,
                        },
                    ]"
                    @click="
                        $emit('openFilter');
                        openMenu = false;
                    "
                />
                <Search
                    v-if="route.name in routesData"
                    class="header-icon"
                    @click="
                        hideHeader = true;
                        openMenu = false;
                    "
                />
                <Download
                    v-if="route.params.id"
                    class="header-icon text-mm-success!"
                    @click="$emit('triggerDownload')"
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
                    :is="item.path ? 'RouterLink' : 'button'"
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
        <main class="flex-1 overflow-y-auto scrollbar-none">
            <slot />
        </main>

        <!-- Navbar za smartphone -->
        <nav
            class="h-20 bg-mm-navy flex justify-around items-center border-t border-mm-gray"
        >
            <RouterLink
                v-for="(item, idx) in doctypesData.filter((i) => !i.menuItem)"
                :to="item.path"
                class="text-mm-gray size-16.5 rounded-xl"
                active-class="bg-mm-lightnavy text-mm-primary"
                :class="{
                    'text-mm-primary':
                        item.path.slice(1) === $route.meta.parentName,
                }"
                :key="idx"
            >
                <div class="h-full flex flex-col items-center justify-center">
                    <component :is="item.icon" class="size-10 stroke-[1.5]" />
                    <span class="text-xs">{{ item.label }}</span>
                </div>
            </RouterLink>
        </nav>
    </div>

    <!-- Veći ekrani -->
    <div
        class="hidden md:flex h-dvh bg-mm-dark max-w-3xl mx-auto border-x border-mm-gray"
    >
        <!-- Sidebar za sve veće ekrane -->
        <aside
            class="flex flex-col justify-between w-50 bg-mm-navy border-r border-mm-gray"
        >
            <nav class="px-3">
                <RouterLink
                    to="/"
                    class="h-20 grid place-items-center border-b border-mm-gray"
                >
                    <span class="text-4xl font-extrabold">
                        <span class="text-mm-white">BIZ</span>
                        <span class="text-mm-primary">MON</span>
                    </span>
                </RouterLink>
                <RouterLink
                    v-for="(item, idx) in [
                        doctypesData[2],
                        ...doctypesData.toSpliced(2, 1),
                    ]"
                    :to="item.path"
                    class="flex items-center gap-4 p-3 text-mm-gray w-full py-3 border-b border-mm-gray"
                    active-class="text-mm-primary bg-mm-lightnavy"
                    :key="idx"
                >
                    <component :is="item.icon" class="size-10" />
                    <span class="text-lg">{{ item.label }}</span>
                </RouterLink>
            </nav>

            <div class="px-3">
                <div
                    class="w-full py-3 border-t border-mm-gray cursor-pointer"
                    @click="logOut()"
                >
                    <div
                        class="flex items-center justify-center gap-4 text-mm-error/70"
                    >
                        <LogOut class="size-10" />
                        <span class="text-lg">Odjava</span>
                    </div>
                </div>
            </div>
        </aside>

        <div class="flex flex-col w-full h-full">
            <!-- Header -->
            <div
                v-if="!hideHeader"
                class="relative bg-mm-navy h-20 flex items-center justify-between gap-3 px-6 border-b border-mm-gray"
            >
                <RouterLink
                    v-if="route.params.id"
                    :to="{ name: route.meta.parentName }"
                >
                    <ArrowLeft class="header-icon" />
                </RouterLink>
                <span
                    class="text-mm-white font-medium line-clamp-2 text-center"
                    :class="route.params.id ? 'text-2xl' : 'text-4xl'"
                >
                    {{
                        route.params.id
                            ? docTitle
                            : doctypesData.find((x) => x.path === route.path)
                                  .label
                    }}
                </span>
                <div class="flex items-center gap-2">
                    <div
                        v-if="route.name === 'dashboard'"
                        class="flex items-center text-mm-white font font-semibold pe-3 cursor-pointer"
                        :class="{
                            'text-mm-primary!': infoActive,
                        }"
                        @click="
                            $emit('openInfo');
                            openMenu = false;
                        "
                    >
                        <User class="size-11 p-1.5" />
                        <span class="text-lg">Info</span>
                    </div>
                    <Funnel
                        v-if="
                            route.name in routesData &&
                            routesData[route.name].isDocument
                        "
                        class="header-icon"
                        :class="[
                            {
                                'text-mm-success!':
                                    filterActive && !filterOpened,
                            },
                            {
                                'icon-active': filterOpened,
                            },
                        ]"
                        @click="
                            $emit('openFilter');
                            openMenu = false;
                        "
                    />
                    <Search
                        v-if="route.name in routesData"
                        class="header-icon"
                        @click="
                            hideHeader = true;
                            openMenu = false;
                        "
                    />
                    <Download
                        v-if="route.params.id"
                        class="header-icon text-mm-success!"
                        @click="$emit('triggerDownload')"
                    />
                </div>
            </div>

            <!-- Slot za sadržaj -->
            <main class="flex-1 overflow-y-auto scrollbar-none">
                <slot />
            </main>
        </div>
    </div>
</template>

<style scoped>
    @reference '@/assets/main.css';

    .header-icon {
        @apply size-11 text-mm-gray p-1.5 cursor-pointer;
    }

    .icon-active {
        @apply text-mm-primary bg-mm-lightnavy rounded-lg;
    }
</style>
