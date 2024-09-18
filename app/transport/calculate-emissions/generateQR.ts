import sharp from "sharp";
import { renderSVG } from "uqr";

export default async function generateQR(transactionAddress: string, transportEmissions: number): Promise<{ qrCodeSvg: string, qrCodeJpg: Buffer }> {
    // Generate QR code with packageAddress and co2Emissions using `renderSVG` from `uqr`
    const qrCodeData = JSON.stringify({ transactionAddress, transportEmissions });
    const qrCodeSvg = renderSVG(qrCodeData, { pixelSize: 5, ecc: 'L', border: 2 });
  
    // Use sharp to convert the SVG to a JPEG buffer
    const qrCodeJpg = await sharp(Buffer.from(qrCodeSvg)) // Convert SVG string to Buffer
      .jpeg() // Convert it to JPEG format
      .toBuffer(); // Get the JPEG as a buffer
  
    return {qrCodeJpg, qrCodeSvg};
}