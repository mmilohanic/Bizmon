import DashboardView from "@/views/DashboardView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { auth, loggedUser } from "@/firebase";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "dashboard",
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

router.beforeEach(async (to) => {
    await auth.authStateReady();
    const publicRoute = ["login", "register"].includes(to.name);

    if (!loggedUser.value && !publicRoute) return { name: "login" };
    if (loggedUser.value && publicRoute) return { name: "dashboard" };
});

export default router;
