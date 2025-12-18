import { supabase } from './supabase';

export async function processCheckin(
  qrCode: string,
  eventId: string,
  checkinUserId: string
) {
  // Mulai transaksi untuk menghindari double check-in
  const { data: participant, error: fetchError } = await supabase
    .from('event_participants')
    .select('*')
    .eq('qr_code', qrCode)
    .eq('event_id', eventId)
    .single();

  if (fetchError || !participant) {
    return {
      success: false,
      message: 'QR Code không hợp lệ',
      code: 'INVALID_QR',
    };
  }

  // Cek xem đã check-in chưa
  if (participant.check_in_status === 'checked_in') {
    await logAudit(eventId, participant.id, 'duplicate_checkin', 'failed', {
      message: 'Người dùng đã check-in',
    });

    return {
      success: false,
      message: 'Bạn đã check-in rồi, không thể check-in lần thứ 2',
      code: 'ALREADY_CHECKED_IN',
      participant: {
        name: participant.participant_name,
        email: participant.participant_email,
      },
    };
  }

  // Update check-in status
  const { error: updateError } = await supabase
    .from('event_participants')
    .update({
      check_in_status: 'checked_in',
      check_in_time: new Date().toISOString(),
      check_in_by: checkinUserId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', participant.id);

  if (updateError) {
    await logAudit(eventId, participant.id, 'checkin', 'failed', {
      error: updateError.message,
    });

    return {
      success: false,
      message: 'Lỗi khi cập nhật trạng thái',
      code: 'UPDATE_FAILED',
    };
  }

  // Log thành công
  await logAudit(eventId, participant.id, 'checkin', 'success', {
    checkinTime: new Date().toISOString(),
  });

  return {
    success: true,
    message: 'Check-in thành công',
    participant: {
      id: participant.id,
      name: participant.participant_name,
      email: participant.participant_email,
      unit: participant.unit,
      position: participant.position,
    },
  };
}

export async function manualCheckin(
  participantId: string,
  eventId: string,
  checkinUserId: string
) {
  const { data: participant, error: fetchError } = await supabase
    .from('event_participants')
    .select('*')
    .eq('id', participantId)
    .eq('event_id', eventId)
    .single();

  if (fetchError || !participant) {
    return {
      success: false,
      message: 'Người tham gia không tồn tại',
    };
  }

  if (participant.check_in_status === 'checked_in') {
    return {
      success: false,
      message: 'Người này đã check-in rồi',
    };
  }

  const { error: updateError } = await supabase
    .from('event_participants')
    .update({
      check_in_status: 'checked_in',
      check_in_time: new Date().toISOString(),
      check_in_by: checkinUserId,
      manual_checkin: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', participantId);

  if (updateError) {
    return {
      success: false,
      message: 'Lỗi cập nhật',
    };
  }

  await logAudit(eventId, participantId, 'manual_checkin', 'success', {
    checkinTime: new Date().toISOString(),
    performedBy: checkinUserId,
  });

  return {
    success: true,
    message: 'Check-in thủ công thành công',
    participant,
  };
}

async function logAudit(
  eventId: string,
  participantId: string,
  action: string,
  status: string,
  details: any
) {
  await supabase.from('audit_logs').insert({
    event_id: eventId,
    participant_id: participantId,
    action,
    status,
    details,
  });
}
