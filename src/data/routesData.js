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
        modalTitles: {
            add: "Unos artikla",
            edit: "Uredi artikl",
        },
        infoMsgs: {
            none: "Nema artikala",
            succ: "Artikl je uspješno unesen.",
        },
    },
    clients: {
        addEditModal: AddEditClientForm,
        infoModal: ClientInfo,
        modalTitles: {
            add: "Unos klijenta",
            edit: "Uredi klijenta",
        },
        infoMsgs: {
            none: "Nema klijenata",
            succ: "Klijent je uspješno unesen.",
        },
    },
    quotes: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalTitles: {
            add: "Unos ponude",
            edit: "Uredi ponudu",
        },
        infoMsgs: {
            none: "Nema ponuda",
            succ: "Ponuda je uspješno unesena.",
        },
        status: {
            Kreirana: "muted",
            Poslana: "warning",
            Prihvaćena: "success",
            Odbijena: "error",
        },
    },
    orders: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalTitles: {
            add: "Unos narudžbe",
            edit: "Uredi narudžbu",
        },
        infoMsgs: {
            none: "Nema narudžbi",
            succ: "Narudžba je uspješno unesena.",
        },
        status: {
            Kreirana: "muted",
            Poslana: "warning",
            Plaćena: "success",
        },
    },
    "work-orders": {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalTitles: {
            add: "Unos radnog naloga",
            edit: "Uredi radni nalog",
        },
        infoMsgs: {
            none: "Nema radnih naloga",
            succ: "Radni nalog je uspješno unesen.",
        },
        status: {
            Otvoren: "warning",
            Zatvoren: "success",
        },
    },
    invoices: {
        addEditModal: AddEditDocumentForm,
        infoModal: DocumentInfo,
        modalTitles: {
            add: "Unos računa",
            edit: "Uredi račun",
        },
        infoMsgs: {
            none: "Nema računa",
            succ: "Račun je uspješno unesen.",
        },
        status: {
            Kreiran: "muted",
            Poslan: "warning",
            Plaćen: "success",
        },
    },
};
