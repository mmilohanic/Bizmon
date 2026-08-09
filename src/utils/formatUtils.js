export function formatPrice(num) {
    return new Intl.NumberFormat("hr-HR", {
        style: "currency",
        currency: "EUR",
    }).format(num.toFixed(2));
}
