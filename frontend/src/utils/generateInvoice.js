import { jsPDF } from 'jspdf';

export function generateInvoice(order, vendorName, shopName) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header background
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 45, 'F');

  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('GoGoods', 20, 22);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Goods Delivery Platform', 20, 32);

  // Invoice label
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('DELIVERY INVOICE', pageW - 20, 22, { align: 'right' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`#INV-${order._id.slice(-8).toUpperCase()}`, pageW - 20, 32, { align:'right' });

  // Date
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', {
    day:'2-digit', month:'long', year:'numeric'
  })}`, 20, 58);
  doc.text(`Status: ${order.status.replace(/_/g,' ').toUpperCase()}`, pageW - 20, 58, { align:'right' });

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(20, 63, pageW - 20, 63);

  // Vendor & Driver info box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 68, (pageW - 50) / 2, 50, 4, 4, 'F');
  doc.roundedRect((pageW / 2) + 5, 68, (pageW - 50) / 2, 50, 4, 4, 'F');

  // Vendor section
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('FROM (VENDOR)', 28, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(vendorName || 'N/A', 28, 86);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(shopName || '', 28, 93);
  doc.text(`Pickup: ${order.pickupAddress}`, 28, 102, { maxWidth: (pageW - 50) / 2 - 16 });

  // Driver section
  const dCol = (pageW / 2) + 13;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('DRIVER', dCol, 77);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.text(order.driver?.name || 'Unassigned', dCol, 86);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(
    `${order.driver?.vehicle || ''} · ${order.driver?.vehicleNumber || ''}`,
    dCol, 93
  );
  doc.text(`Drop: ${order.deliveryAddress}`, dCol, 102,
    { maxWidth: (pageW - 50) / 2 - 16 });

  // Order details table header
  doc.setFillColor(37, 99, 235);
  doc.rect(20, 128, pageW - 40, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description',    28,  135);
  doc.text('Distance',      105,  135);
  doc.text('Vehicle',       135,  135);
  doc.text('Amount',   pageW - 20, 135, { align:'right' });

  // Table row
  doc.setFillColor(255, 255, 255);
  doc.rect(20, 138, pageW - 40, 14, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const desc = order.goodsDescription?.length > 35
    ? order.goodsDescription.slice(0, 35) + '...'
    : order.goodsDescription;
  doc.text(desc || '', 28, 147);
  doc.text(`${order.distanceKm} km`,     105, 147);
  doc.text(order.vehicleType || '',      135, 147);
  doc.text(`Rs. ${order.fare}`, pageW - 20, 147, { align:'right' });

  // Fare breakdown box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(pageW - 90, 158, 70, 50, 4, 4, 'F');

 // ఈ lines replace చేయి:
const rateCard = { bike: 22,  van: 77,  heavy: 150 };
const baseFare = { bike: 30,  van: 100, heavy: 200 };
  const vType    = order.vehicleType || 'bike';
  const base     = baseFare[vType];
  const perKm    = rateCard[vType];
  const distFare = parseFloat(order.distanceKm || 0) * perKm;

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Base fare:',       pageW - 86, 167);
  doc.text(`Rs. ${base}`,      pageW - 24, 167, { align:'right' });
  doc.text(`Distance (${order.distanceKm}km × Rs.${perKm}):`, pageW - 86, 175);
  doc.text(`Rs. ${distFare}`,  pageW - 24, 175, { align:'right' });

  doc.setDrawColor(200, 210, 220);
  doc.line(pageW - 86, 179, pageW - 22, 179);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('Total:',        pageW - 86, 188);
  doc.text(`Rs. ${order.fare}`, pageW - 24, 188, { align:'right' });

  // Rating
  if (order.rating) {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica','normal');
    doc.setFontSize(9);
    doc.text(`Customer Rating: ${'★'.repeat(order.rating)}${'☆'.repeat(5-order.rating)}`,
      20, 190);
  }

  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, doc.internal.pageSize.getHeight() - 25,
    pageW, 25, 'F');
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing GoGoods — Fast. Reliable. Transparent.',
    pageW / 2, doc.internal.pageSize.getHeight() - 14, { align:'center' });
  doc.text('gogoods.in · support@gogoods.in',
    pageW / 2, doc.internal.pageSize.getHeight() - 7, { align:'center' });

  // Download
  doc.save(`GoGoods-Invoice-${order._id.slice(-8).toUpperCase()}.pdf`);
}