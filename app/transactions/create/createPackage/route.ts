/**
 * 
 * This API route handles POST requests to create a package on the blockchain without a transporter and send email notifications to the relevant parties.
 * It interacts with FusionAuth to retrieve email addresses associated with blockchain addresses, and uses SMTP to send transaction notifications.
 * @module
 */

import { natixarFactory } from '@/app/blockchain/src';
import { Utils } from '@/app/blockchain/src/ClientSDK/Utils';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

/**
 * Helper function to fetch an email associated with a blockchain address from FusionAuth.
 * 
 * @param {string} blockchainAddress - The blockchain address to search for.
 * @returns {Promise<string | null>} The associated email or null if not found.
 */
async function fetchEmailByBlockchainAddress(blockchainAddress: string): Promise<string | null> {
  try {
    const groupResponse = await fetch(`${process.env.FUSIONAUTH_ISSUER}/api/group`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-FusionAuth-TenantId': `${process.env.FUSIONAUTH_TENANTID}`,
        Authorization: `${process.env.FUSIONAUTH_API_KEY}`,
      },
    });

    if (!groupResponse.ok) {
      throw new Error('Failed to fetch groups from FusionAuth');
    }

    const data = await groupResponse.json();
    const group = data.groups.find((group: any) => group.data.blockchainAddress === blockchainAddress);
    return group ? group.data.email : null;
  } catch (error) {
    console.error('Error fetching email:', error);
    return null;
  }
}

/**
 * Helper function to send an email using SMTP.
 * 
 * @param {string} to - The recipient email address.
 * @param {string} subject - The subject of the email.
 * @param {string} text - The content of the email.
 */
async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.NODEMAILER_DOMAIN,
    port: Number(process.env.NODEMAILER_PORT),
    secure: false,
    tls: {
      rejectUnauthorized: false, // If you have a self-signed certificate
    },
  });

  const mailOptions = {
    from: '"Blockchain App" <robot@natixar.pro>',
    to,
    subject,
    text,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(info)
}

/**
 * Schema to validate user inputs for creating a package without a transporter.
 */
const userInputsSchema = z.object({
  from: z.string().min(1, "from cannot be empty"),
  to: z.string().min(1, "to cannot be empty"),
  transporterEmail: z.string().email("Invalid email format"), // Ensure valid email format for transporterEmail
  product: z.string().min(1, "product cannot be empty"),
  quantity: z.number().gt(1, "quantity must be greater than 1"),
});


/**
 * POST handler for creating a package on the blockchain without a transporter and sending notification emails.
 * 
 * @param {NextRequest} request - The incoming request object containing package details and account info.
 * @returns {Promise<NextResponse>} A JSON response indicating success or failure of the package creation and email notifications.
 * 
 * @throws {Error} Will throw if input validation fails, emails cannot be fetched, or if there is an issue with blockchain or email processes.
 * 
 * @remarks
 * This function:
 * 1. Validates the user inputs using a schema.
 * 2. Creates a package on the blockchain without a transporter.
 * 3. Retrieves email addresses associated with the blockchain addresses from and to.
 * 4. Sends notification emails to the transporter and both parties involved in the transaction.
 * 
 * @example
 * // Example of an API request to this route:
 * fetch('/transactions/create/createPackage', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     from: '0xFromAddress',
 *     to: '0xToAddress',
 *     transporterEmail: 'transporter@example.com',
 *     product: 'Mineral',
 *     quantity: 100,
 *   })
 * });
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const groupId = request.headers.get('X-FusionAuth-GroupId');
    const validatedInputs = userInputsSchema.safeParse(await request.json());
    if (!validatedInputs.success || !groupId) {
      throw new Error(`${validatedInputs.error}`);
    }
    const { from, to, transporterEmail, product, quantity } = validatedInputs.data;

    // Create the package without transporter
    const createPackageWithoutTransporterReceipt = await natixarFactory.method("createPackageWithoutTransporter").params(from, to, product, Utils.toUint18Decimals(quantity)).sendTransaction(groupId);
    const transactionAddress = createPackageWithoutTransporterReceipt.parsedLog?.CreatePackageWithoutTransporter.params.packageWithoutTransporter;

    // Fetch emails for from and to
    const fromEmail = await fetchEmailByBlockchainAddress(from);
    const toEmail = await fetchEmailByBlockchainAddress(to);
    if (!fromEmail || !toEmail) {
      throw new Error('Failed to retrieve email addresses for from or to.');
    }

    // Send email to transporter
    const transporterEmailText = `A transaction has been created for you to transport the product. 
                                  Please fill out the emissions form at the following link:
                                  http://localhost:3000/transport/emissions-form?transactionAddress=${transactionAddress}&email=${transporterEmail}`;


    // Send emails to from and to
    const commonText = `A transaction is involving you:
    From: ${from} (Blockchain Address: ${from})
    To: ${to} (Blockchain Address: ${to})
    Product: ${product}
    Quantity: ${quantity} kg`;

    await Promise.all([
      await sendEmail(transporterEmail, 'New Transport Assignment', transporterEmailText),
      await sendEmail(fromEmail, 'Transaction Notification', commonText),
      await sendEmail(toEmail, 'Transaction Notification', commonText)
    ]);

    console.log(`http://localhost:3000/transport/emissions-form?transactionAddress=${transactionAddress}&email=${transporterEmail}`);

    return NextResponse.json({ message: 'Package created and emails sent successfully.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create package and send emails.' }, { status: 500 });
  }
}
