export default function filterByDateRange(
    arr = [],
    start = new Date(0),
    end = new Date(),
) {
    return arr.filter(
        (document) =>
            document.createdAt.toDate() >= start &&
            document.createdAt.toDate() <= end,
    );
}
