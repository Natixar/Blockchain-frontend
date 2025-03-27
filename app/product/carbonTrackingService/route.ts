import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FactorySingleton } from '@/app/blockchain/src';
import { Product } from '../Tproduct';
import qrcode from 'qrcode-generator';

interface Transaction {
txHash?: string;
from: string;
to: string;
value: string;
blockNumber?: string | number;
footprintValue?: string;
}

interface RequestBody {
mineralAddress: string;
hash: string;
groups: Array<any>;
product: Product;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
try {
//----------------------------------------------------------------------
// 1. Retrieve and validate input parameters
//----------------------------------------------------------------------
const body: RequestBody = await request.json();
const { mineralAddress, hash, groups, product } = body;

if (!mineralAddress || !mineralAddress.startsWith('0x')) {
  return NextResponse.json(
    { error: 'Invalid or missing mineralAddress' },
    { status: 400 }
  );
}
if (!hash || !hash.startsWith('0x')) {
  return NextResponse.json(
    { error: 'Missing or invalid hash ID' },
    { status: 400 }
  );
}
if (!groups) {
  return NextResponse.json(
    { error: 'Missing or invalid groups' },
    { status: 400 }
  );
}
if (!product) {
  return NextResponse.json(
    { error: 'Missing or invalid product' },
    { status: 400 }
  );
}

//----------------------------------------------------------------------
// 2. Fetch transactions
//----------------------------------------------------------------------
let transactions: Transaction[] = [];
try {
  transactions = await FactorySingleton.history(mineralAddress, hash);
  transactions.reverse();
} catch (err) {
  console.error('Error fetching history:', err);
}

//----------------------------------------------------------------------
// 3. Helper functions
//----------------------------------------------------------------------
const formatAddress = (addr?: string): string => {
  if (!addr) return "Not Available";
  if (addr === "0x0000000000000000000000000000000000000000") {
    return "ORIGIN (0x0000000000000000000000000000000000000000)";
  }
  const match = groups.find(e => e.blockchainAddress.toLowerCase() === addr.toLowerCase());
  return match ? `${match.name} (${addr})` : addr;
};


const formatValue = (val?: string): string => {
  if (!val) return '0.00';
  // If val is >1000, assume typical 1e18 conversions; otherwise, use it directly
  return (Number(val) / (Number(val) > 1000 ? 1e18 : 1)).toFixed(2);
};

//----------------------------------------------------------------------
// 4. Summaries & metrics
//----------------------------------------------------------------------

const origin =
  transactions.length > 0
    ? transactions[0].from
    : 'Not Available';
const destination =
  transactions.length > 0
    ? transactions[transactions.length - 1].to
    : 'Not Available';

//----------------------------------------------------------------------
// 5. Initialize jsPDF
//----------------------------------------------------------------------
const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

// Page & layout constants
const PAGE_WIDTH = doc.internal.pageSize.getWidth();
const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const MARGIN_TOP = 20;
const FOOTER_HEIGHT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_LEFT + MARGIN_RIGHT);
let yPos = MARGIN_TOP; // Tracks vertical position

// Colors & fonts
const colors = {
  primary: '#1976D2',
  light: '#F5F8FA',
  text: '#212121',
  textLight: '#424242',
  white: '#FFFFFF',
  border: '#E0E0E0'
};
const fonts = {
  heading: 'helvetica',
  body: 'helvetica',
  mono: 'courier'
};

// Color helper
const setColor = (hex: string, type: 'fill' | 'text' | 'draw') => {
  const hexToRgb = (hexVal: string) => {
    const shortRx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    const fullHex = hexVal.replace(shortRx, (_m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : { r: 0, g: 0, b: 0 };
  };
  const { r, g, b } = hexToRgb(hex);
  switch (type) {
    case 'fill': doc.setFillColor(r, g, b); break;
    case 'text': doc.setTextColor(r, g, b); break;
    case 'draw': doc.setDrawColor(r, g, b); break;
  }
};

//----------------------------------------------------------------------
// 6. PAGE 1
//----------------------------------------------------------------------

// -- (A) Page 1 Header bar
const HEADER_HEIGHT = 35;
setColor(colors.primary, 'fill');
doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');
// Title: Centered
setColor(colors.white, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(16);
doc.text('NATIXAR - CARBON TRACKING CERTIFICATE', PAGE_WIDTH / 2, HEADER_HEIGHT / 2 + 4, { align: 'center' });
// Move vertical pointer
yPos = HEADER_HEIGHT + 10;

// -- (C) Product Supply Chain Information Header
const SECTION_HEADER_HEIGHT = 10;
setColor(colors.primary, 'fill');
doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, SECTION_HEADER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(10);
doc.text('PRODUCT SUPPLY CHAIN INFORMATION', MARGIN_LEFT + 5, yPos + SECTION_HEADER_HEIGHT - 3.5);
yPos += SECTION_HEADER_HEIGHT + 8;

// -- (D) Overview paragraph
setColor(colors.textLight, 'text');
doc.setFont(fonts.body, 'normal');
doc.setFontSize(10);
const overviewText =
  'This certificate details the carbon emissions associated with the supply chain of this material. All transactions are recorded on the blockchain.';
const lines = doc.splitTextToSize(overviewText, CONTENT_WIDTH);
doc.text(lines, MARGIN_LEFT, yPos);
yPos += lines.length * 5 + 10;

// -- (E) Summary Box (Origin, Destination, Steps, Quantity, CO2)
const SUMMARY_BOX_HEIGHT = 67;
setColor(colors.light, 'fill');
setColor(colors.border, 'draw');
doc.roundedRect(MARGIN_LEFT, yPos, CONTENT_WIDTH, SUMMARY_BOX_HEIGHT, 3, 3, 'FD');
const padding = 5;
let boxY = yPos + padding;
setColor(colors.primary, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(10);
doc.text('Key Supply Chain Details', MARGIN_LEFT + padding, boxY + 4);
boxY += 10;

// Row 1: Contract Address / Quantity
setColor(colors.text, 'text');
doc.setFont(fonts.body, 'bold');
doc.setFontSize(9);
const col1X = MARGIN_LEFT + padding;
const col2X = MARGIN_LEFT + CONTENT_WIDTH / 2;
doc.text('Contract Address:', col1X, boxY);
doc.text('Current Quantity (tons):', col2X, boxY);
boxY += 5;

doc.setFont(fonts.mono, 'normal');
doc.setFontSize(8);
const addressLines = doc.splitTextToSize(`${product.name} (${product.symbol})\n${product.address}`, (CONTENT_WIDTH / 2) - padding * 2);
doc.text(addressLines, col1X, boxY);
doc.text(product.quantity.toString(), col2X, boxY);
boxY += 15;

// Row 2: Origin / Steps
doc.setFont(fonts.body, 'bold');
doc.setFontSize(9);
doc.text('Origin:', col1X, boxY);
doc.text('Total Steps:', col2X, boxY);
boxY += 5;

doc.setFont(fonts.mono, 'normal');
doc.setFontSize(8);
const originLines = doc.splitTextToSize(formatAddress(origin), (CONTENT_WIDTH / 2) - padding * 2);
doc.text(originLines, col1X, boxY);
doc.text(`${transactions.length}`, col2X, boxY);
boxY += 15;

// Row 3: Final Destination / Total CO2
doc.setFont(fonts.body, 'bold');
doc.setFontSize(9);
doc.text('Final Destination:', col1X, boxY);
doc.text('Total CO2 (tons):', col2X, boxY);
boxY += 5;

doc.setFont(fonts.mono, 'normal');
doc.setFontSize(8);
const destLines = doc.splitTextToSize(formatAddress(destination), (CONTENT_WIDTH / 2) - padding * 2);
doc.text(destLines, col1X, boxY);
doc.text(`${product.co2}`, col2X, boxY);
boxY += 10;

// Move Y below box
yPos += SUMMARY_BOX_HEIGHT + 10;


// qrcode
// -- Add QR Code
const QR_SIZE = 60; // Size of QR code in mm
const QR_Y_POSITION = PAGE_HEIGHT * 0.72; // Position at about 2/3 down the page

// Generate QR code with contract info - using higher type (8 instead of 6)
// Type 8 can hold more data
const qr = qrcode(8, 'M'); // Increased from type 6 to type 8 for more capacity

// Reduce the amount of data if needed - create a shorter URL or identifier
// Option 1: Full data (might be too much)
// qr.addData(`Contract: ${product.address}\nProduct: ${product.name} (${product.symbol})\nQuantity: ${product.quantity} tons\nCO2: ${product.co2} tons`);

// Option 2: Reduced data - just the essential contract info
qr.addData(`${product.address}`);

qr.make();

// Draw QR code background with rounded corners and shadow
const qrX = (PAGE_WIDTH - QR_SIZE) / 2; // Center horizontally
const qrY = QR_Y_POSITION - QR_SIZE / 2; // Position at 2/3 down

// Add shadow effect
setColor('#DDDDDD', 'fill');
doc.roundedRect(qrX + 2, qrY + 2, QR_SIZE, QR_SIZE, 4, 4, 'F');

// Add white background
setColor(colors.white, 'fill');
setColor(colors.border, 'draw');
doc.roundedRect(qrX, qrY, QR_SIZE, QR_SIZE, 4, 4, 'FD');

// Convert QR code to data URL and add to PDF
const qrImage = qr.createDataURL(4);
doc.addImage(qrImage, 'PNG', qrX + 5, qrY + 5, QR_SIZE - 10, QR_SIZE - 10);

// Add decorative elements around QR code
setColor(colors.primary, 'draw');
doc.setLineWidth(1);

// Draw stylish corners
const cornerSize = 8;
// Top-left corner
doc.line(qrX, qrY + cornerSize, qrX, qrY);
doc.line(qrX, qrY, qrX + cornerSize, qrY);
// Top-right corner
doc.line(qrX + QR_SIZE - cornerSize, qrY, qrX + QR_SIZE, qrY);
doc.line(qrX + QR_SIZE, qrY, qrX + QR_SIZE, qrY + cornerSize);
// Bottom-left corner
doc.line(qrX, qrY + QR_SIZE - cornerSize, qrX, qrY + QR_SIZE);
doc.line(qrX, qrY + QR_SIZE, qrX + cornerSize, qrY + QR_SIZE);
// Bottom-right corner
doc.line(qrX + QR_SIZE - cornerSize, qrY + QR_SIZE, qrX + QR_SIZE, qrY + QR_SIZE);
doc.line(qrX + QR_SIZE, qrY + QR_SIZE, qrX + QR_SIZE, qrY + QR_SIZE - cornerSize);

// Add label above QR code
setColor(colors.primary, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(10);
doc.text('SCAN FOR BLOCKCHAIN VERIFICATION', PAGE_WIDTH / 2, qrY - 4, { align: 'center' });

// Add label below QR code with the contract details
setColor(colors.textLight, 'text');
doc.setFont(fonts.body, 'normal');
doc.setFontSize(8);
doc.text('Scan to verify contract authenticity', PAGE_WIDTH / 2, qrY + QR_SIZE + 6, { align: 'center' });

// qrcode


// -- (F) Page 1 Footer
const footerY = PAGE_HEIGHT - FOOTER_HEIGHT;
setColor(colors.primary, 'fill');
doc.rect(0, footerY, PAGE_WIDTH, FOOTER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.body, 'normal');
doc.setFontSize(9);
doc.text('Natixar Blockchain-Verified Carbon Certificate', MARGIN_LEFT, footerY + 12);
// Generation Date: Right
doc.setFontSize(9);
doc.text(
  `Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`,
  PAGE_WIDTH - 10,
  footerY + 12,
  { align: 'right' }
);
//----------------------------------------------------------------------
// 7. PAGE 2: Chart & Transaction Table
//----------------------------------------------------------------------
doc.addPage();
yPos = MARGIN_TOP;

// -- (A) Header bar on Page 2
setColor(colors.primary, 'fill');
doc.rect(0, 0, PAGE_WIDTH, HEADER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(14);
doc.text('CARBON TRACKING DETAILS', MARGIN_LEFT, HEADER_HEIGHT / 2 + 4);
yPos = HEADER_HEIGHT + 10;

// -- (B) Chart Section Header
const CHART_HEADER_HEIGHT = 10;
setColor(colors.primary, 'fill');
doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, CHART_HEADER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(10);
doc.text('CO2 EMISSIONS BY TRANSACTION', MARGIN_LEFT + 5, yPos + CHART_HEADER_HEIGHT - 3.5);
yPos += CHART_HEADER_HEIGHT + 8;

// -- (C) Bar Chart
const CHART_HEIGHT = 80;
setColor(colors.light, 'fill');
doc.setDrawColor(220, 220, 220);
doc.setLineWidth(0.5);
doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, CHART_HEIGHT, 'FD');

// Prepare bar chart data
const reversedTx = [...transactions].reverse();
const numberOfTx = reversedTx.length || 1;
const barSpacing = CONTENT_WIDTH / numberOfTx;
const barWidth = Math.min(25, barSpacing * 0.7);
const maxFootprint = Math.max(...reversedTx.map(tx => parseFloat(tx.footprintValue || '0')), 10);
const scaleMax = Math.ceil(maxFootprint / 10) * 10;

// Grid lines
const steps = 5;
setColor('#e0e0e0', 'draw');
doc.setLineWidth(0.2);
for (let i = 0; i <= steps; i++) {
  const gridY = yPos + CHART_HEIGHT - (i * (CHART_HEIGHT / steps));
  doc.line(MARGIN_LEFT, gridY, MARGIN_LEFT + CONTENT_WIDTH, gridY);
  setColor(colors.textLight, 'text');
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(7);
  doc.text(`${(scaleMax * i) / steps}`, MARGIN_LEFT - 3, gridY + 2, { align: 'right' });
}

// Draw bars
for (let i = 0; i < reversedTx.length; i++) {
  const tx = reversedTx[i];
  const footprintNum = parseFloat(tx.footprintValue || '0');
  const barH = (footprintNum / scaleMax) * CHART_HEIGHT;
  const barX = MARGIN_LEFT + i * barSpacing + (barSpacing - barWidth) / 2;
  const barY = yPos + CHART_HEIGHT - barH;

  setColor(colors.primary, 'fill');
  doc.rect(barX, barY, barWidth, barH, 'F');

  // Label above bar
  setColor(colors.textLight, 'text');
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(7);
  doc.text(footprintNum.toFixed(1), barX + barWidth / 2, barY - 2, { align: 'center' });

  // X-axis label (optional)
  if (reversedTx.length <= 12 || i % Math.ceil(reversedTx.length / 12) === 0) {
    doc.text(`Step ${i + 1}`, barX + barWidth / 2, yPos + CHART_HEIGHT + 5, { align: 'center' });
  }
}

yPos += CHART_HEIGHT + 12;
setColor(colors.textLight, 'text');
doc.setFontSize(8);
doc.text('Each bar represents the CO2 (tons) recorded for that transaction.', MARGIN_LEFT, yPos);
yPos += 10;

// -- (D) Transaction History Header
const HISTORY_HEADER_HEIGHT = 10;
setColor(colors.primary, 'fill');
doc.rect(MARGIN_LEFT, yPos, CONTENT_WIDTH, HISTORY_HEADER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.heading, 'bold');
doc.setFontSize(10);
doc.text('SUPPLY CHAIN TRANSACTION HISTORY', MARGIN_LEFT + 5, yPos + HISTORY_HEADER_HEIGHT - 3.5);
yPos += HISTORY_HEADER_HEIGHT + 8;
setColor(colors.textLight, 'text');
doc.setFont(fonts.body, 'normal');
doc.setFontSize(9);
doc.text(
  `Below are all ${transactions.length} steps recorded on the blockchain.`,
  MARGIN_LEFT,
  yPos
);
yPos += 8;

// -- (E) Transaction Table (autoTable or fallback)
if (typeof (doc as any).autoTable === 'function') {
  const headers = [
    { header: 'Block #', dataKey: 'block' },
    { header: 'From', dataKey: 'from' },
    { header: 'To', dataKey: 'to' },
    { header: 'Quantity (tons)', dataKey: 'quantity' },
    { header: 'CO2 (tons)', dataKey: 'co2' }
  ];
  const tableData = transactions.map(tx => ({
    block: tx.blockNumber ? tx.blockNumber.toString() : 'N/A',
    from: formatAddress(tx.from),
    to: formatAddress(tx.to),
    quantity: formatValue(tx.value),
    co2: formatValue(tx.footprintValue)
  }));

  const hexToRgb = (hexVal: string) => {
    hexVal = hexVal.replace('#', '');
    return {
      r: parseInt(hexVal.substring(0, 2), 16),
      g: parseInt(hexVal.substring(2, 4), 16),
      b: parseInt(hexVal.substring(4, 6), 16)
    };
  };

  (doc as any).autoTable({
    startY: yPos,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [headers.map(h => h.header)],
    body: tableData.map(row => headers.map(h => row[h.dataKey as keyof typeof row])),
    styles: {
      fontSize: 7,
      font: fonts.body,
      cellPadding: 3,
      lineColor: hexToRgb(colors.border),
      lineWidth: 0.2,
      overflow: 'ellipsize',
      charSpace: -0.1
    },
    headStyles: {
      fillColor: hexToRgb(colors.primary),
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 50, font: fonts.mono, fontSize: 6 },
      2: { cellWidth: 50, font: fonts.mono, fontSize: 6 },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' }
    },
    didDrawCell: () => {
      doc.setCharSpace(0);
    }
  });
  yPos = (doc as any).lastAutoTable.finalY + 10;
} else {
  // Simple fallback table
  setColor(colors.text, 'text');
  doc.setFont(fonts.body, 'normal');
  doc.setFontSize(8);

  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (yPos > PAGE_HEIGHT - FOOTER_HEIGHT - 25) {
      doc.addPage();
      yPos = MARGIN_TOP;
    }

    if (i % 2 === 0) {
      setColor(colors.light, 'fill');
      doc.rect(MARGIN_LEFT, yPos - 5, CONTENT_WIDTH, 24, 'F');
    }
    setColor(colors.text, 'text');
    doc.setFont(fonts.body, 'bold');
    doc.text(`Transaction #${i + 1} (Block: ${tx.blockNumber || 'N/A'})`, MARGIN_LEFT + 3, yPos);
    yPos += 6;
    doc.setFont(fonts.mono, 'normal');
    doc.text(`From: ${formatAddress(tx.from)}`, MARGIN_LEFT + 8, yPos);
    yPos += 5;
    doc.text(`To:   ${formatAddress(tx.to)}`, MARGIN_LEFT + 8, yPos);
    yPos += 5;
    doc.setFont(fonts.body, 'normal');
    doc.text(
      `Quantity: ${formatValue(tx.value)} tons, CO2: ${formatValue(tx.footprintValue)} tons`,
      MARGIN_LEFT + 8,
      yPos
    );
    yPos += 10;
  }
}

// -- (F) Page 2 Footer
setColor(colors.primary, 'fill');
doc.rect(0, footerY, PAGE_WIDTH, FOOTER_HEIGHT, 'F');
setColor(colors.white, 'text');
doc.setFont(fonts.body, 'normal');
doc.setFontSize(9);
doc.text('Natixar Blockchain-Verified Carbon Certificate', MARGIN_LEFT, footerY + 12);
// Generation Date: Right
doc.setFontSize(9);
doc.text(
  `Generated: ${new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}`,
  PAGE_WIDTH - 10,
  footerY + 12,
  { align: 'right' }
);

//----------------------------------------------------------------------
// 8. Return the generated PDF
//----------------------------------------------------------------------
const pdfBlob = doc.output('blob');
const arrayBuffer = await pdfBlob.arrayBuffer();
return new NextResponse(arrayBuffer, {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="carbon-certificate-${Date.now()}.pdf"`
  }
});
} catch (error) {
console.error('Error generating PDF:', error);
return NextResponse.json(
{
error: 'Failed to generate PDF',
details: error instanceof Error ? error.message : String(error)
},
{ status: 500 }
);
}
}

