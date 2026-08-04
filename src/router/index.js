import DashboardView from "@/views/DashboardView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { auth, loggedUser } from "@/firebase";
import DocumentsView from "@/views/DocumentsView.vue";

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
            path: "/quotes",
            name: "quotes",
            component: DocumentsView,
        },
        {
            path: "/orders",
            name: "orders",
            component: DocumentsView,
        },
        {
            path: "/work-orders",
            name: "work-orders",
            component: DocumentsView,
        },
        {
            path: "/invoices",
            name: "invoices",
            component: DocumentsView,
        },
        {
            path: "/items",
            name: "items",
            component: DocumentsView,
        },
        {
            path: "/clients",
            name: "clients",
            component: DocumentsView,
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
