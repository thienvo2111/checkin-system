'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  event_name: string;
  event_date: string;
  status: string;
}

interface CheckinStats {
  total: number;
  checkedIn: number;
  pending: number;
  noShow: number;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<CheckinStats>({
    total: 0,
    checkedIn: 0,
    pending: 0,
    noShow: 0,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get events
      const { data: eventsData } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false });

      setEvents(eventsData || []);

      // Get stats
      const { count: totalParticipants } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' });

      const { count: checkedInCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' })
        .eq('check_in_status', 'checked_in');

      const { count: pendingCount } = await supabase
        .from('event_participants')
        .select('*', { count: 'exact' })
        .eq('check_in_status', 'pending');

      setStats({
        total: totalParticipants || 0,
        checkedIn: checkedInCount || 0,
        pending: pendingCount || 0,
        noShow: (totalParticipants || 0) - (checkedInCount || 0) - (pendingCount || 0),
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="container py-6">
          <h1 className="text-3xl font-bold text-slate-900">
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ
          </h1>
          <p className="text-slate-500 mt-2">Quản lý sự kiện và theo dõi check-in</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="card">
            <p className="text-slate-500 text-sm font-medium mb-2">Tổng Cộng</p>
            <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="card">
            <p className="text-slate-500 text-sm font-medium mb-2">Đã Check-in</p>
            <p className="text-3xl font-bold text-green-500">{stats.checkedIn}</p>
          </div>
          <div className="card">
            <p className="text-slate-500 text-sm font-medium mb-2">Chờ Check-in</p>
            <p className="text-3xl font-bold text-orange-500">{stats.pending}</p>
          </div>
          <div className="card">
            <p className="text-slate-500 text-sm font-medium mb-2">Không Check-in</p>
            <p className="text-3xl font-bold text-red-500">{stats.noShow}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <button
            onClick={() => router.push('/admin/events')}
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              📋 Quản Lý Sự Kiện
            </h3>
            <p className="text-slate-500 text-sm">Tạo, chỉnh sửa sự kiện</p>
          </button>

          <button
            onClick={() => router.push('/admin/send-emails')}
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              📧 Gửi Email QR
            </h3>
            <p className="text-slate-500 text-sm">Gửi mã QR cho người tham gia</p>
          </button>

          <button
            onClick={() => router.push('/admin/reports')}
            className="card hover:shadow-md transition cursor-pointer"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              📊 Báo Cáo
            </h3>
            <p className="text-slate-500 text-sm">Xem chi tiết check-in</p>
          </button>
        </div>

        {/* Events List */}
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sự Kiện Gần Đây</h2>

          {loading ? (
            <p className="text-slate-500">Đang tải...</p>
          ) : events.length === 0 ? (
            <p className="text-slate-500">Chưa có sự kiện nào</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Tên Sự Kiện
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Ngày
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Trạng Thái
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-border hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">{event.event_name}</td>
                      <td className="py-3 px-4">
                        {new Date(event.event_date).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => router.push(`/admin/events/${event.id}`)}
                          className="text-teal-500 hover:text-teal-600 font-medium"
                        >
                          Chi Tiết →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
