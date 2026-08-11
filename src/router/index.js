import DashboardView from "@/views/DashboardView.vue";
import DocumentView from "@/views/DocumentView.vue";
import DocumentsView from "@/views/DocumentsView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { auth, loggedUser } from "@/firebase";

const DOC_TYPES = {
    quotes: "Ponude",
    orders: "Narudžbe",
    "work-orders": "Radni nalozi",
    invoices: "Računi",
    items: "Artikli",
    clients: "Klijenti",
};

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            name: "dashboard",
            component: DashboardView,
            meta: {
                title: "Početna",
            },
        },
        {
            path: "/login",
            name: "login",
            component: LoginView,
            meta: {
                title: "Prijava",
            },
        },
        {
            path: "/register",
            name: "register",
            component: RegisterView,
            meta: {
                title: "Registracija",
            },
        },
        ...Object.keys(DOC_TYPES).map((type) => ({
            path: `/${type}`,
            name: type,
            component: DocumentsView,
            meta: {
                title: DOC_TYPES[type],
            },
        })),
        ...Object.keys(DOC_TYPES)
            .slice(0, -2)
            .map((type) => ({
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
            meta: {
                title: "Nepostojeća",
            },
        },
    ],
});

router.beforeEach(async (to) => {
    document.title = to.meta.title ? `${to.meta.title} · Bizmon` : "Bizmon";

    await auth.authStateReady();
    const publicRoute = ["login", "register"].includes(to.name);

    if (!loggedUser.value && !publicRoute) return { name: "login" };
    if (loggedUser.value && publicRoute) return { name: "dashboard" };
});

export default router;
