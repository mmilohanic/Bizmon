<script setup>
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
    import {
        CircleUser,
        FileText,
        ListTodo,
        Package,
        ReceiptEuro,
        ChartNoAxesCombined,
        ChevronDown,
        CreditCard,
        Receipt,
    } from "@lucide/vue";
    import { ref } from "vue";

    const options = [
        "ovaj mjesec",
        "zadnji mjesec",
        "3 mjeseca",
        "6 mjeseci",
        "jedna godina",
        "od početka",
    ];

    const navbarItems = [
        {
            icon: FileText,
            label: "Ponude",
        },
        {
            icon: Package,
            label: "Narudžbe",
        },
        {
            icon: CircleUser,
            label: "Početna",
        },
        {
            icon: ListTodo,
            label: "Nalozi",
        },
        {
            icon: ReceiptEuro,
            label: "Računi",
        },
    ];

    const billsTest = [
        {
            type: "Naplaćeno",
            amount: 7,
            total: 2568.34,
        },
        {
            type: "Otvoreno",
            amount: 5,
            total: 768.46,
        },
    ];

    const recentActivity = ref(false);
    const recentTest = [
        {
            name: "Klime zgrada Žminj",
            type: "bill",
        },
        {
            name: "Sv. Lovreč - iskop Perić",
            type: "offer",
        },
        {
            name: "Elektroinstalacija Marić",
            type: "order",
        },
    ];

    const selected = ref(options[0]);
    const open = ref(false);

    function select(option) {
        selected.value = option;
        open.value = false;
    }

    function chooseIcon(document) {
        switch (document) {
            case "offer":
                return FileText;
            case "order":
                return Package;
            case "task":
                return ListTodo;
            case "bill":
                return ReceiptEuro;
        }
    }
</script>

<template>
    <div class="bg-mm-dark h-screen">
        <DashboardHeader class="fixed top-0 w-full" />

        <div class="py-26 px-8 flex flex-col gap-4">
            <!-- Statistika -->
            <div class="dashboard-section">
                <div class="flex justify-between items-center">
                    <div class="flex gap-2 items-start">
                        <ChartNoAxesCombined class="size-8 mt-0.5" />
                        <span class="text-[28px]">Statistika</span>
                    </div>

                    <!-- Filter dropdown -->
                    <div class="relative w-35">
                        <div
                            class="flex bg-mm-white text-black ps-2 pe-1 py-0.5 rounded justify-between"
                            :class="{ 'rounded-bl-none rounded-br-none': open }"
                            @click="open = !open"
                        >
                            <span>{{ selected }}</span>
                            <ChevronDown />
                        </div>

                        <ul
                            v-if="open"
                            class="absolute w-full bg-mm-white text-black rounded-bl rounded-br"
                        >
                            <li
                                v-for="(option,, idx) in options.filter(
                                    (item) => item != selected,
                                )"
                                class="w-[95%] mx-auto px-1 py-0.5 border-t border-mm-gray"
                                @click="select(option)"
                                :key="idx"
                            >
                                {{ option }}
                            </li>
                        </ul>
                    </div>
                </div>

                <hr class="border-mm-gray border mt-3 mb-4" />

                <div class="flex flex-col">
                    <div
                        v-for="(item, idx) in navbarItems.filter(
                            (item) => item.label != 'Početna',
                        )"
                        class="flex py-2 first:pt-1 last:pb-0 pe-1 items-end justify-between not-first:border-t not-first:border-mm-gray font-semibold"
                        :key="idx"
                    >
                        <div class="flex items-center gap-4">
                            <component :is="item.icon" />
                            <span class="text-xl">{{ item.label }}</span>
                        </div>
                        <span class="text-xl">{{ idx }}</span>
                    </div>
                </div>
            </div>

            <!-- Računi -->
            <div class="dashboard-section">
                <div class="flex gap-2 items-center">
                    <CreditCard class="size-8" />
                    <span class="text-[28px]">Računi</span>
                </div>
                <hr class="border-mm-gray border mt-2 mb-4" />
                <div class="flex flex-col gap-3 px-1">
                    <div
                        v-for="ent in billsTest"
                        class="flex items-center justify-between px-0.5"
                    >
                        <div class="flex flex-col tracking-wide">
                            <span class="text-xl">{{ ent.type }}</span>
                            <span class="text-md text-mm-gray"
                                >{{ ent.amount }} računa</span
                            >
                        </div>
                        <span class="text-2xl">{{ ent.total }} €</span>
                    </div>
                </div>
            </div>

            <!-- Nedavna aktivnost -->
            <div class="dashboard-section">
                <span class="text-[28px] px-1">Nedavna aktivnost</span>
                <hr class="border-mm-gray border mt-2 mb-4" />
                <div class="flex flex-col gap-3 px-1">
                    <div
                        v-if="!recentActivity"
                        class="text-lg font-semibold flex flex-col items-center"
                    >
                        <span>Nije još zabilježena</span>
                        <span>nikakva aktivnost.</span>
                    </div>
                    <div
                        v-else
                        v-for="doc in recentTest"
                        class="flex items-center gap-2"
                    >
                        <component :is="chooseIcon(doc.type)" />
                        <span class="text-xl font-semibold">{{
                            doc.name
                        }}</span>
                    </div>
                </div>
            </div>
        </div>

        <MobileNavbar :nav-items="navbarItems" class="fixed bottom-0 w-full" />
    </div>
</template>

<style scoped>
    @reference "@/assets/main.css";

    .dashboard-section {
        @apply bg-mm-lightnavy p-4 rounded-3xl text-mm-white;
    }
</style>
