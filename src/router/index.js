import DashboardView from "@/views/DashboardView.vue";
import DocumentView from "@/views/DocumentView.vue";
import DocumentsView from "@/views/DocumentsView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { auth, loggedUser } from "@/firebase";

const DOC_TYPES = [
    "quotes",
    "orders",
    "work-orders",
    "invoices",
    "items",
    "clients",
];

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
        ...DOC_TYPES.map((type) => ({
            path: `/${type}`,
            name: type,
            component: DocumentsView,
        })),
        ...DOC_TYPES.slice(0, -2).map((type) => ({
            path: `/${type}/:id`,
            name: `${type}-document`,
            component: DocumentView,
            meta: {
                parentName: type,
            },
        })),
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
