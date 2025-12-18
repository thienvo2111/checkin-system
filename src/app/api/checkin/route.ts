import { NextRequest, NextResponse } from 'next/server';
import { processCheckin } from '@/lib/checkin-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { qrCode, eventId } = await request.json();

    // Validate input
    if (!qrCode || !eventId) {
      return NextResponse.json(
        { success: false, message: 'QR Code và Event ID là bắt buộc' },
        { status: 400 }
      );
    }

    // Get user from session
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Process check-in
    const result = await processCheckin(qrCode, eventId, session.user.id);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
