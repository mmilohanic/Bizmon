<script setup>
    import DashboardHeader from "@/components/DashboardHeader.vue";
    import MobileNavbar from "@/components/MobileNavbar.vue";
</script>

<template>
    <div class="bg-mm-dark h-screen">
        <DashboardHeader class="fixed top-0 w-full z-10" />

        <MobileNavbar class="fixed bottom-0 w-full z-10" />
    </div>
</template>
