'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        const { data: user } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        setIsLoggedIn(true);

        if (user?.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user?.role === 'checkin_staff') {
          router.push('/checkin/scanner');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #8B0000 0%, #FFD700 100%)',
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(43, 122, 120, 0.3)',
          borderRadius: '50%',
          borderTop: '3px solid #2B7A78',
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (isLoggedIn) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Desktop Background */}
      <div className="hidden md:block absolute inset-0 -z-10">
        <Image
          src="/images/home-desktop.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(139, 0, 0, 0.6), rgba(139, 0, 0, 0.4), rgba(139, 0, 0, 0))',
        }} />
      </div>

      {/* Mobile Background */}
      <div className="md:hidden absolute inset-0 -z-10">
        <Image
          src="/images/home-mobile.png"
          alt="Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(139, 0, 0, 0.5), rgba(139, 0, 0, 0.4), rgba(139, 0, 0, 0.6))',
        }} />
      </div>

      {/* Header with Background */}
      <header style={{
        position: 'relative',
        zIndex: 20,
        width: '100%',
        background: 'linear-gradient(90deg, rgba(139, 0, 0, 0.85) 0%, rgba(178, 34, 34, 0.85) 50%, rgba(139, 0, 0, 0.75) 100%)',
        borderBottom: '2px solid rgba(255, 215, 0, 0.4)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
      }}>
        <div className="container" style={{
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '100%',
        }}>
          <div style={{
            flexShrink: 0,
            width: '60px',
            height: '60px',
            position: 'relative',
          }}>
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={110}
              height={60}
              style={{
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
              }}
              priority
            />
          </div>
          <div style={{
            flex: 1,
            minWidth: 0,
          }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#FFD700',
              margin: '0 0 2px 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              JCI Check-in
            </h2>
            <p style={{
              fontSize: '12px',
              color: '#E8E8E8',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              Event Management System
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 10,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px',
        }}>
          {/* Card */}
          <div className="card">
            {/* Header */}
            <div style={{
              textAlign: 'center',
              marginBottom: '32px',
            }}>
              <h1 style={{
                fontSize: '36px',
                marginBottom: '12px',
              }}>
                ĐĂNG KÝ / ĐĂNG NHẬP
              </h1>
              <div style={{
                height: '3px',
                width: '60px',
                background: 'linear-gradient(to right, #FFD700, #FFA500)',
                margin: '0 auto 12px auto',
                borderRadius: '2px',
              }} />
              <p style={{
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px',
                whiteSpace: 'nowrap',
              }}>
                Hệ Thống Quản Lý Check-in Sự Kiện
              </p>
              <p style={{
                color: '#999999',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}>
                2026 JCI VIETNAM NEW YEAR CONVENTION
              </p>
            </div>

            {/* Info Text */}
            <p style={{
              textAlign: 'center',
              color: '#666666',
              marginBottom: '24px',
              fontSize: '14px',
            }}>
              Vui lòng đăng nhập để tiếp tục sử dụng hệ thống quản lý check-in
            </p>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '24px',
            }}>
              <button
                onClick={() => router.push('/auth/login')}
                className="btn btn-primary"
              >
                Đăng Nhập
              </button>

              <button
                onClick={() => router.push('/auth/register')}
                className="btn btn-secondary"
              >
                Đăng Ký Tài Khoản
              </button>
            </div>

            {/* Divider */}
            <div style={{
              position: 'relative',
              margin: '24px 0',
              display: 'flex',
              alignItems: 'center',
            }}>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#cccccc',
              }} />
              <span style={{
                padding: '0 8px',
                color: '#999999',
                fontSize: '12px',
                whiteSpace: 'nowrap',
              }}>
                Hoặc
              </span>
              <div style={{
                flex: 1,
                height: '1px',
                background: '#cccccc',
              }} />
            </div>

            {/* Role Info */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                background: '#E3F2FD',
                borderRadius: '8px',
                border: '1px solid #BBDEFB',
              }}>
                <span style={{
                  fontSize: '20px',
                  marginTop: '2px',
                  flexShrink: 0,
                }}>
                  👤
                </span>
                <div style={{
                  minWidth: 0,
                }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#333333',
                    fontSize: '14px',
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                  }}>
                    Admin
                  </p>
                  <p style={{
                    color: '#666666',
                    fontSize: '12px',
                    margin: 0,
                    wordWrap: 'break-word',
                  }}>
                    Quản lý sự kiện, gửi email QR, xem báo cáo
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '12px',
                padding: '12px',
                background: '#E8F5E9',
                borderRadius: '8px',
                border: '1px solid #C8E6C9',
              }}>
                <span style={{
                  fontSize: '20px',
                  marginTop: '2px',
                  flexShrink: 0,
                }}>
                  📱
                </span>
                <div style={{
                  minWidth: 0,
                }}>
                  <p style={{
                    fontWeight: '600',
                    color: '#333333',
                    fontSize: '14px',
                    margin: '0 0 4px 0',
                    whiteSpace: 'nowrap',
                  }}>
                    Check-in Staff
                  </p>
                  <p style={{
                    color: '#666666',
                    fontSize: '12px',
                    margin: 0,
                    wordWrap: 'break-word',
                  }}>
                    Quét QR code tại cổng, manual check-in
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer style={{
            marginTop: '32px',
            textAlign: 'center',
          }}>
            <p style={{
              fontSize: '12px',
              color: '#aaaaaa',
              marginBottom: '12px',
            }}>
              © 2026 JCI Vietnam Check-in System. All rights reserved.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              fontSize: '12px',
              color: '#888888',
              flexWrap: 'wrap',
            }}>
              <a href="#" style={{
                color: '#888888',
                textDecoration: 'none',
              }}>
                Privacy
              </a>
              <span>•</span>
              <a href="#" style={{
                color: '#888888',
                textDecoration: 'none',
              }}>
                Terms
              </a>
              <span>•</span>
              <a href="#" style={{
                color: '#888888',
                textDecoration: 'none',
              }}>
                Support
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
