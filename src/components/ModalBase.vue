<template>
    <div
        class="bg-mm-dark/80 z-20 flex items-center justify-center px-8 fixed inset-0"
    >
        <div
            @click.stop
            class="bg-mm-lightnavy border border-mm-gray rounded-2xl p-6 text-mm-white w-full"
        >
            <slot />
        </div>
    </div>
</template>
