export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'checkin_staff' | 'viewer';
  full_name: string;
  created_at: string;
}

export interface Event {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  location: string;
  status: 'draft' | 'published' | 'active' | 'closed';
  google_sheet_id: string;
  created_by: string;
  created_at: string;
}

export interface Participant {
  id: string;
  event_id: string;
  participant_id: string;
  participant_name: string;
  participant_email: string;
  unit: string;
  position: string;
  qr_code: string;
  check_in_status: 'pending' | 'checked_in' | 'no_show';
  check_in_time?: string;
  manual_checkin: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  event_id: string;
  participant_id: string;
  action: string;
  status: string;
  details: Record<string, any>;
  created_at: string;
}

export interface CheckinResponse {
  success: boolean;
  message: string;
  code?: string;
  participant?: {
    id: string;
    name: string;
    email: string;
    unit: string;
    position: string;
  };
}
