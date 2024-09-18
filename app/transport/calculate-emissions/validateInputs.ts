import { NextRequest } from 'next/server';
import { z } from 'zod';

// Create zod schemas directly from the TypeScript string union types
const transportTypeEnum = z.enum(['truck', 'train', 'ship', 'airship', 'barge'] as const);
const energyTypeEnum = z.enum(['diesel', 'electricity', 'cng', 'lng', 'biofuel', 'hfo', 'mdo', 'jetfuel'] as const);

// Define the schema for each TransportSegment
const transportSegmentSchema = z.object({
  transportType: transportTypeEnum,  // Use the transportTypeEnum generated from the TypeScript type
  energyType: energyTypeEnum,        // Use the energyTypeEnum generated from the TypeScript type
  from: z.string().min(1),           // Non-empty string for the 'from' field
  to: z.string().min(1),             // Non-empty string for the 'to' field
});

// Define the overall schema for user inputs
const userInputsSchema = z.object({
  segments: z.array(transportSegmentSchema).min(1),  // Array of TransportSegment objects, at least one element
  loadCarried: z.number().gt(1),                     // Validate loadCarried as a number greater than 1
  transactionAddress: z.string().min(1),             // Non-empty string for transactionAddress
  email: z.string().email()                          // Validate as a proper email address
});

export default async function validateInputs(request: NextRequest) {
  const validatedInputs = userInputsSchema.safeParse(await request.json())
  if (!validatedInputs.success) {
      throw new Error(`${validatedInputs.error}`);
  }
  return validatedInputs.data;
}