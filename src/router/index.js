import DashboardView from "@/views/DashboardView.vue";
import Error404 from "@/views/Error404.vue";
import LoginView from "@/views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import { createRouter, createWebHistory } from "vue-router";
import { auth, loggedUser } from "@/firebase";
import QuotesView from "@/views/QuotesView.vue";
import OrdersView from "@/views/OrdersView.vue";
import WorkOrdersView from "@/views/WorkOrdersView.vue";
import ClientsView from "@/views/ClientsView.vue";
import ItemsView from "@/views/ItemsView.vue";
import InvoicesView from "@/views/InvoicesView.vue";

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
            component: QuotesView,
        },
        {
            path: "/orders",
            name: "orders",
            component: OrdersView,
        },
        {
            path: "/work-orders",
            name: "work-orders",
            component: WorkOrdersView,
        },
        {
            path: "/invoices",
            name: "invoices",
            component: InvoicesView,
        },
        {
            path: "/items",
            name: "items",
            component: ItemsView,
        },
        {
            path: "/clients",
            name: "clients",
            component: ClientsView,
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
