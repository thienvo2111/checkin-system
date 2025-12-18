import { NextRequest, NextResponse } from 'next/server';
import { sendBulkQRCodeEmails } from '@/lib/email-sender';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { eventId, participantIds } = await request.json();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    // Check admin permission
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.json({ success: false }, { status: 403 });
    }

    // Get event details
    const { data: event } = await supabase
      .from('events')
      .select('event_name')
      .eq('id', eventId)
      .single();

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'Sự kiện không tồn tại' },
        { status: 404 }
      );
    }

    // Get participants
    const { data: participants } = await supabase
      .from('event_participants')
      .select('id, participant_name, participant_email, qr_code')
      .eq('event_id', eventId)
      .in('id', participantIds || []);

    if (!participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy người tham gia' },
        { status: 404 }
      );
    }

    // Send emails
    const result = await sendBulkQRCodeEmails(
      participants.map((p) => ({
        email: p.participant_email,
        name: p.participant_name,
        qrCode: p.qr_code,
      })),
      event.event_name
    );

    return NextResponse.json({
      success: true,
      message: `Gửi ${result.successful} email thành công`,
      ...result,
    });
  } catch (error) {
    console.error('Send emails error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
