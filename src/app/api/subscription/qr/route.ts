import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import {
  SUBSCRIPTION_CURRENCY,
  SUBSCRIPTION_TOTAL_AMOUNT,
  SUBSCRIPTION_UPI_ID,
} from '@/lib/subscription-config';

export async function GET(req: NextRequest) {
  try {
    const upiId = req.nextUrl.searchParams.get('upiId') || SUBSCRIPTION_UPI_ID;
    const amount = req.nextUrl.searchParams.get('amount') || String(SUBSCRIPTION_TOTAL_AMOUNT);
    const note = req.nextUrl.searchParams.get('note') || 'QuizzBuzz Subscription 365 days';

    const query = new URLSearchParams({
      pa: upiId,
      pn: 'QuizzBuzz',
      am: amount,
      cu: SUBSCRIPTION_CURRENCY,
      tn: note,
    });
    const upiLink = `upi://pay?${query.toString()}`;

    const png = await QRCode.toBuffer(upiLink, { width: 512, margin: 1 });
    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
