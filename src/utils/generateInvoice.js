import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a PDF invoice.
 *
 * @param {object} params
 * @param {object}   params.order        - Backend order response data
 * @param {object}   params.address      - Shipping/billing address object
 * @param {Array}    params.cartItems    - Array of cart item objects
 * @param {object}   params.user         - Authenticated user object
 * @param {string}   params.sessionId    - Stripe session / payment ID
 */
export const generateInvoice = ({ order, address, cartItems, user, sessionId }) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Smartcart", 14, 20);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("smartcart.com", 14, 27);
    doc.setTextColor(0);

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", pageWidth - 14, 20, { align: "right" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    const orderId = order?.orderId ?? order?.id ?? sessionId ?? "N/A";
    doc.text(`Invoice #: ${orderId}`, pageWidth - 14, 27, { align: "right" });
    doc.text(`Date: ${dateStr}`, pageWidth - 14, 33, { align: "right" });
    doc.setTextColor(0);

    // ── Divider ──────────────────────────────────────────────────────────────
    doc.setDrawColor(200);
    doc.line(14, 38, pageWidth - 14, 38);

    // ── Bill To ──────────────────────────────────────────────────────────────
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 14, 46);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const customerName = user?.username || user?.userName || user?.name || "Customer";
    const customerEmail = user?.email || "";

    const billLines = [
        customerName,
        customerEmail,
        address?.buildingName || "",
        address?.street || "",
        `${address?.city || ""}${address?.state ? ", " + address.state : ""}`,
        `${address?.pincode || ""}${address?.country ? "  " + address.country : ""}`,
    ].filter(Boolean);

    let billY = 52;
    billLines.forEach((line) => {
        doc.text(line, 14, billY);
        billY += 5;
    });

    // ── Payment Info ─────────────────────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.text("Payment Method:", pageWidth / 2, 46);
    doc.setFont("helvetica", "normal");
    doc.text("Stripe", pageWidth / 2, 51);
    doc.text(`Status: Paid`, pageWidth / 2, 56);

    // ── Items Table ──────────────────────────────────────────────────────────
    const tableStartY = Math.max(billY, 72) + 4;

    const rows = cartItems.map((item, idx) => {
        const qty = Number(item?.quantity || 0);
        const price = Number(item?.specialPrice || item?.price || 0);
        const total = (qty * price).toFixed(2);
        return [
            idx + 1,
            item?.productName || "Product",
            `$${price.toFixed(2)}`,
            qty,
            `$${total}`,
        ];
    });

    autoTable(doc, {
        startY: tableStartY,
        head: [["#", "Product", "Unit Price", "Qty", "Total"]],
        body: rows,
        headStyles: { fillColor: [30, 30, 30], textColor: 255, fontStyle: "bold" },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        columnStyles: {
            0: { cellWidth: 10, halign: "center" },
            2: { halign: "right" },
            3: { halign: "center" },
            4: { halign: "right" },
        },
        margin: { left: 14, right: 14 },
    });

    // ── Totals ───────────────────────────────────────────────────────────────
    const finalY = doc.lastAutoTable.finalY + 6;
    const subtotal = cartItems.reduce(
        (sum, item) =>
            sum + Number(item?.specialPrice || item?.price || 0) * Number(item?.quantity || 0),
        0
    );
    // Use backend total if available (more authoritative), fall back to computed
    const grandTotal = Number(order?.totalAmount ?? order?.totalPrice ?? subtotal).toFixed(2);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", pageWidth - 60, finalY);
    doc.text(`$${subtotal.toFixed(2)}`, pageWidth - 14, finalY, { align: "right" });

    doc.text("Tax (0%):", pageWidth - 60, finalY + 6);
    doc.text("$0.00", pageWidth - 14, finalY + 6, { align: "right" });

    doc.setFont("helvetica", "bold");
    doc.text("Total:", pageWidth - 60, finalY + 14);
    doc.text(`$${grandTotal}`, pageWidth - 14, finalY + 14, { align: "right" });

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for shopping with Smartcart!", pageWidth / 2, pageHeight - 10, {
        align: "center",
    });

    // ── Download ─────────────────────────────────────────────────────────────
    const fileName = `smartcart-invoice-${orderId}.pdf`;
    doc.save(fileName);
};
