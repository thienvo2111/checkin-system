'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRScanner from '@/components/QRScanner';
import { supabase } from '@/lib/supabase';

interface Event {
  id: string;
  event_name: string;
}

interface CheckinResponse {
  success: boolean;
  message: string;
  code?: string;
  participant?: {
    name: string;
    email: string;
    unit: string;
    position: string;
  };
}

export default function ScannerPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadEvents();
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  const loadEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, event_name')
      .eq('status', 'active');
    setEvents(data || []);
    if (data && data.length > 0) {
      setSelectedEvent(data.id);
    }
  };

  const handleScan = async (qrCode: string) => {
    if (loading || !selectedEvent) return;

    setLoading(true);
    setIsScanning(false);

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode,
          eventId: selectedEvent,
        }),
      });

      const data: CheckinResponse = await response.json();
      setResult(data);

      if (data.success) {
        setTimeout(() => {
          setResult(null);
          setIsScanning(true);
        }, 3000);
      } else {
        setTimeout(() => {
          setResult(null);
          setIsScanning(true);
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Lỗi kết nối',
      });
      setIsScanning(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 flex flex-col">
      {/* Header */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          QUÉT MÃ QR CHECK-IN
        </h1>
        <p className="text-gray-300">
          Sự kiện: {new Date().toLocaleDateString('vi-VN')}
        </p>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          {/* Event Selection */}
          <div className="mb-8">
            <label className="block text-white font-semibold mb-3">
              Chọn sự kiện:
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border-2 border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 font-medium"
            >
              <option value="">-- Chọn sự kiện --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.event_name}
                </option>
              ))}
            </select>
          </div>

          {/* Result Display */}
          {result ? (
            <div
              className={`rounded-xl p-12 text-center mb-8 transform transition ${
                result.success
                  ? 'bg-green-500 text-white scale-100'
                  : 'bg-red-500 text-white scale-100'
              }`}
            >
              <h2 className="text-5xl font-bold mb-4">
                {result.success ? '✓' : '✗'}
              </h2>
              <h3 className="text-3xl font-bold mb-2">
                {result.success ? 'THÀNH CÔNG' : 'LỖI'}
              </h3>
              <p className="text-lg mb-6">{result.message}</p>
              {result.participant && (
                <div className="text-left bg-black bg-opacity-30 rounded-lg p-6 space-y-2">
                  <p className="text-lg">
                    <strong>👤 Tên:</strong> {result.participant.name}
                  </p>
                  <p className="text-lg">
                    <strong>🏢 Đơn vị:</strong> {result.participant.unit}
                  </p>
                  <p className="text-lg">
                    <strong>💼 Chức vụ:</strong> {result.participant.position}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Scanner */}
              {isScanning && selectedEvent ? (
                <>
                  <QRScanner
                    onScan={handleScan}
                    isScanning={isScanning && !loading}
                  />
                  <p className="text-center text-gray-300 mt-4">
                    Đưa mã QR vào khung để quét
                  </p>
                </>
              ) : !selectedEvent ? (
                <div className="bg-slate-700 rounded-lg p-12 text-center text-gray-300 border-2 border-slate-600">
                  <p className="text-lg">Vui lòng chọn sự kiện trước</p>
                </div>
              ) : null}
            </>
          )}

          {/* Scan Button */}
          {!isScanning && !result && selectedEvent && (
            <button
              onClick={() => setIsScanning(true)}
              className="w-full mt-8 bg-teal-500 hover:bg-teal-600 text-white font-bold py-4 px-4 rounded-lg transition transform hover:scale-105 text-lg"
            >
              Bắt Đầu Quét
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
