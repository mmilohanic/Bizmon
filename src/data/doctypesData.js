import {
    CircleUser,
    FileText,
    ListTodo,
    Package,
    ReceiptEuro,
} from "@lucide/vue";

export default [
    {
        icon: FileText,
        label: "Ponude",
        path: "/offers",
    },
    {
        icon: Package,
        label: "Narudžbe",
        path: "/orders",
    },
    {
        icon: CircleUser,
        label: "Početna",
        path: "/",
    },
    {
        icon: ListTodo,
        label: "Nalozi",
        path: "/tasks",
    },
    {
        icon: ReceiptEuro,
        label: "Računi",
        path: "/bills",
    },
];
