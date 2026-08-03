import {
    CircleUser,
    FileText,
    Handshake,
    ListTodo,
    Package,
    ReceiptEuro,
    StretchHorizontal,
} from "@lucide/vue";

export default [
    {
        icon: FileText,
        label: "Ponude",
        path: "/quotes",
        menuItem: false,
    },
    {
        icon: Package,
        label: "Narudžbe",
        path: "/orders",
        menuItem: false,
    },
    {
        icon: CircleUser,
        label: "Početna",
        path: "/",
        menuItem: false,
    },
    {
        icon: ListTodo,
        label: "Nalozi",
        path: "/work-orders",
        menuItem: false,
    },
    {
        icon: ReceiptEuro,
        label: "Računi",
        path: "/invoices",
        menuItem: false,
    },
    {
        icon: StretchHorizontal,
        label: "Artikli",
        path: "/items",
        menuItem: true,
    },
    {
        icon: Handshake,
        label: "Klijenti",
        path: "/clients",
        menuItem: true,
    },
];
