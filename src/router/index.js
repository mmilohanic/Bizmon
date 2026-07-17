import DashboardView from "@/views/DashboardView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { useTestingStore } from "@/stores/testingStore";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "početna",
            component: DashboardView,
        },
        {
            path: "/login",
            name: "login",
            component: LoginView,
        },
        {
            path: "/register",
            name: "register",
            component: RegisterView,
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: Error404,
        },
    ],
});

router.beforeEach((to) => {
    const testingStore = useTestingStore();
    const publicRoute = ["login", "register"].includes(to.name);

    if (!testingStore.loggedUser && !publicRoute) return { name: "login" };
    if (testingStore.loggedUser && publicRoute) return { name: "početna" };
});

export default router;
