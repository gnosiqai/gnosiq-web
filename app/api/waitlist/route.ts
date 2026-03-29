import { NextRequest, NextResponse } from 'next/server';
import { addToWaitlist } from '@/lib/firestore';
import { sendWaitlistConfirmation } from '@/lib/sendgrid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const { alreadyExists } = await addToWaitlist({ email, name: name || '' });

    if (!alreadyExists) {
      await sendWaitlistConfirmation({ email, name: name || '' });
    }

    return NextResponse.json(
      {
        success: true,
        message: alreadyExists
          ? 'You are already on the waitlist!'
          : "You're on the waitlist! Check your inbox.",
        alreadyExists,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[/api/waitlist] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
