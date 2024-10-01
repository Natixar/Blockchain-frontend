import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const { input, output, footprint, account } = await request.json();
    try {
        // await app.transformProduct(input, output, footprint, account);
        return NextResponse.json({ message: 'Products transformed successfully.' });
    } catch (error) {
        console.error('Failed to transform products:', error);
        return NextResponse.json({ error: 'Failed to transform products.' }, { status: 500 });
    }
}
