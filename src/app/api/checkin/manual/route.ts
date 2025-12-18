import { NextRequest, NextResponse } from 'next/server';
import { manualCheckin } from '@/lib/checkin-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { participantId, eventId } = await request.json();

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check permission
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!user || !['admin', 'checkin_staff'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Không có quyền' },
        { status: 403 }
      );
    }

    const result = await manualCheckin(participantId, eventId, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Manual checkin error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi máy chủ' },
      { status: 500 }
    );
  }
}
