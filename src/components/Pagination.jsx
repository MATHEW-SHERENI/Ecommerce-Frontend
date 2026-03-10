const buildPageItems = (currentPage, totalPages) => {
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const items = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) items.push("...");
    for (let i = start; i <= end; i += 1) {
        items.push(i);
    }
    if (end < totalPages - 1) items.push("...");
    items.push(totalPages);

    return items;
};

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
    if (totalPages <= 1) return null;

    const items = buildPageItems(currentPage, totalPages);

    return (
        <nav className={`flex items-center justify-center gap-2 py-6 ${className}`.trim()} aria-label="Pagination">
            <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
            >
                Prev
            </button>
            {items.map((item, index) => (
                item === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                        ...
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onPageChange(item)}
                        className={`h-9 min-w-9 rounded-lg border px-3 text-sm font-semibold shadow-sm ${
                            item === currentPage
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                        aria-current={item === currentPage ? "page" : undefined}
                    >
                        {item}
                    </button>
                )
            ))}
            <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
            >
                Next
            </button>
        </nav>
    );
};

export default Pagination;
