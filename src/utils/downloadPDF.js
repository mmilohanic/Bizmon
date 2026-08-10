import { formatPrice } from "./formatUtils";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

pdfMake.addVirtualFileSystem(pdfFonts);

const titles = {
    quotes: "Ponuda",
    orders: "Narudžba",
    "work-orders": "Radni nalog",
    invoices: "Račun",
};

function mergeSameItems(items) {
    const uniqueItems = {};
    for (const item of items) {
        const key = `${item.name}${item.price}${item.unit}`;
        if (uniqueItems[key]) uniqueItems[key].amount += item.amount;
        else uniqueItems[key] = { ...item };
    }
    return Object.values(uniqueItems);
}

function clientInfo(client) {
    let info = [{ text: client.name }];

    if (client.oib) info.push({ text: `OIB: ${client.oib}` });

    if (client.zip && client.town) {
        if (client.street && client.street_num)
            info.push({ text: `${client.street} ${client.street_num}` });

        info.push({ text: `${client.zip} ${client.town}` });
        if (client.country) info[info.length - 1].text += `, ${client.country}`;
    }

    return info;
}

function buildPDF(doc, docType, client) {
    const items = mergeSameItems(doc.docItems);
    const subtotal = items.reduce((a, v) => a + v.price * v.amount, 0);

    const tax = subtotal * 0.25;
    const total = subtotal + tax;

    return {
        pageSize: "A4",
        pageMargins: [40, 40, 40, 60],
        defaultStyle: { fontSize: 12 },

        content: [
            {
                columns: [
                    {
                        stack: [
                            { text: titles[docType], fontSize: 22, bold: true },
                            {
                                text: `ID: ${doc.id}`,
                                color: "#6b7280",
                                fontSize: 10,
                            },
                            {
                                text: `Datum: ${doc.createdAt.toDate().toLocaleDateString("hr-HR")}`,
                                margin: [0, 10, 0, 0],
                            },
                        ],
                    },
                    {
                        alignment: "right",
                        stack: [
                            {
                                text: doc.name,
                                fontSize: 14,
                                bold: true,
                                margin: [0, 5],
                            },
                            ...clientInfo(client),
                        ],
                    },
                ],
            },

            {
                margin: [0, 30, 0, 0],
                table: {
                    headerRows: 1,
                    widths: [20, "*", 50, 50, 70, 75],
                    body: [
                        [
                            { text: "#", style: "th" },
                            { text: "Artikl", style: "th" },
                            { text: "Kol.", style: "th", alignment: "right" },
                            { text: "MJ", style: "th", alignment: "right" },
                            { text: "Cijena", style: "th", alignment: "right" },
                            { text: "Iznos", style: "th", alignment: "right" },
                        ],
                        ...items.map((item, i) => [
                            String(i + 1),
                            item.name,
                            {
                                text: item.amount,
                                alignment: "right",
                            },
                            {
                                text: item.unit,
                                alignment: "right",
                            },
                            {
                                text: formatPrice(item.price),
                                alignment: "right",
                            },
                            {
                                text: formatPrice(item.amount * item.price),
                                alignment: "right",
                            },
                        ]),
                    ],
                },
                layout: "lightHorizontalLines",
            },

            {
                margin: [0, 30, 0, 0],
                columns: [
                    { width: "*", text: "" },
                    {
                        width: 200,
                        table: {
                            widths: ["*", "auto"],
                            body: [
                                [
                                    "Osnovica",
                                    {
                                        text: formatPrice(subtotal),
                                        alignment: "right",
                                    },
                                ],
                                [
                                    "PDV 25%",
                                    {
                                        text: formatPrice(tax),
                                        alignment: "right",
                                    },
                                ],
                                [
                                    {
                                        text: "Ukupno",
                                        bold: true,
                                        fontSize: 12,
                                    },
                                    {
                                        text: formatPrice(total),
                                        bold: true,
                                        fontSize: 12,
                                        alignment: "right",
                                    },
                                ],
                            ],
                        },
                        layout: "noBorders",
                    },
                ],
            },
        ],

        footer: (currentPage, pageCount) => ({
            text: `Stranica: ${currentPage} / ${pageCount}`,
            alignment: "right",
            fontSize: 8,
            color: "#6b7280",
            margin: [0, 0, 40, 0],
        }),

        styles: {
            th: { bold: true, fontSize: 10 },
        },
    };
}

export function downloadPDF(doc, docType, client) {
    if (doc && docType && client)
        pdfMake
            .createPdf(buildPDF(doc, docType, client))
            .download(`${titles[docType]} - ${client.name}.pdf`);
}
