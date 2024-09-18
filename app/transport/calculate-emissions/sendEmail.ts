import { createTransport } from "nodemailer";

export default async function sendEmail(email: string, transportEmissions: number, qrCodeJpg: Buffer): Promise<any> {

    // Set up the email transport using nodemailer
    const transporter = createTransport({
      host: 'localhost',
      port: 2525,
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
    });
  
    // Send email to the transporter
    await transporter.sendMail({
      from: '"Blockchain App" <robot@natixar.pro>',
      to: email,
      subject: 'Transport Package Information',
      html: `
      <p>Dear Transporter,</p>
      <p>Here is the QR code for your transport:</p>
      <div><img src="cid:qrCodeImage" alt="QR Code" /></div>
      <p>Total CO2 Emissions: ${transportEmissions.toFixed(2)} kg</p>
      <p>Thank you for your cooperation.</p>
    `,
      attachments: [
        {
          filename: 'qrcode.jpeg',
          content: qrCodeJpg,
          contentType: 'image/jpeg',
          cid: 'qrCodeImage', // This is important to inline the image
        },
        {
          filename: 'qrcode.jpeg',
          content: qrCodeJpg,
          contentType: 'image/jpeg',
          // No cid for this attachment since it's a classic file attachment
        },
      ],
    });
  }