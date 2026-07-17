<script setup>
    import { ArrowLeft, SearchAlert } from "@lucide/vue";
</script>

<template>
    <div class="bg-mm-dark h-screen flex flex-col items-center px-8">
        <div class="py-10 text-[72px] font-extrabold">
            <span class="text-mm-white">BIZ</span>
            <span class="text-mm-primary">MON</span>
        </div>

        <!-- Uspješna registracija -->
        <div
            class="bg-mm-lightnavy px-6 pt-15 pb-18 rounded-3xl w-full flex flex-col gap-15 items-center"
        >
            <SearchAlert class="size-35 stroke-1 text-mm-warning" />
            <hr class="border-mm-gray w-full" />
            <div
                class="text-3xl text-mm-white flex flex-col items-center font-extralight"
            >
                <span>Tražena lokacija</span>
                <span>nije dostupna</span>
                <span>ili ne postoji.</span>
            </div>
            <button
                @click="$router.replace('/')"
                class="bg-mm-primary text-mm-dark text-lg font-extrabold flex items-center w-fit mx-auto py-2 px-7 rounded-full"
            >
                <div class="flex gap-3 items-center">
                    <ArrowLeft />
                    <span>NATRAG</span>
                </div>
            </button>
        </div>
    </div>
</template>
