import AddEditClientForm from "@/components/AddEditClientForm.vue";
import AddEditDocumentForm from "@/components/AddEditDocumentForm.vue";
import AddEditItemForm from "@/components/AddEditItemForm.vue";
import ClientInfo from "@/components/ClientInfo.vue";
import DocumentInfo from "@/components/DocumentInfo.vue";
import ItemInfo from "@/components/ItemInfo.vue";

export default {
    items: {
        addEditModal: AddEditItemForm,
        infoModal: ItemInfo,
        modalLabels: {
            add: "Unesi artikl",
            edit: "Uredi artikl",
            delete: "Obriši artikl",
        },
        infoMsgs: {
            none: "Nema artikala",
            succ: "Artikl je uspješno unesen.",
        },
        isDocument: false,
    },
    clients: {
        addEditModal: AddEditClientForm,
        infoModal: ClientInfo,
        modalLabels: {
            add: "Unesi klijenta",
            edit: "Uredi klijenta",
            delete: "Obriši klijenta",
        },
        infoMsgs: {
            none: "Nema klijenata",
            succ: "Klijent je uspješno unesen.",
        },
        isDocument: false,
    },
    quotes: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalLabels: {
            add: "Unesi ponudu",
            edit: "Uredi ponudu",
            delete: "Obriši ponudu",
        },
        infoMsgs: {
            none: "Nema ponuda",
            succ: "Ponuda je uspješno unesena.",
        },
        status: {
            Kreirana: "white",
            Poslana: "warning",
            Prihvaćena: "success",
            Odbijena: "error",
        },
        isDocument: true,
    },
    orders: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalLabels: {
            add: "Unesi narudžbu",
            edit: "Uredi narudžbu",
            delete: "Obriši narudžbu",
        },
        infoMsgs: {
            none: "Nema narudžbi",
            succ: "Narudžba je uspješno unesena.",
        },
        status: {
            Kreirana: "white",
            Poslana: "warning",
            Plaćena: "success",
        },
        isDocument: true,
    },
    "work-orders": {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalLabels: {
            add: "Unesi nalog",
            edit: "Uredi nalog",
            delete: "Obriši nalog",
        },
        infoMsgs: {
            none: "Nema radnih naloga",
            succ: "Radni nalog je uspješno unesen.",
        },
        status: {
            Otvoren: "warning",
            Zatvoren: "success",
        },
        isDocument: true,
    },
    invoices: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalLabels: {
            add: "Unesi račun",
            edit: "Uredi račun",
            delete: "Obriši račun",
        },
        infoMsgs: {
            none: "Nema računa",
            succ: "Račun je uspješno unesen.",
        },
        status: {
            Kreiran: "white",
            Poslan: "warning",
            Plaćen: "success",
        },
        isDocument: true,
    },
};
