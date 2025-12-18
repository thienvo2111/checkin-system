import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendQRCodeEmail(
  email: string,
  participantName: string,
  qrCodeDataUrl: string,
  eventName: string
) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Mã QR Code sự kiện</h2>
        <p>Xin chào <strong>${participantName}</strong>,</p>
        <p>Dưới đây là mã QR Code để check-in sự kiện <strong>${eventName}</strong></p>
        <div style="text-align: center; margin: 30px 0;">
          <img src="${qrCodeDataUrl}" alt="QR Code" style="max-width: 300px;" />
        </div>
        <p>Vui lòng xuất trình mã này tại cổng check-in vào ngày diễn ra sự kiện.</p>
        <p>Cảm ơn bạn!</p>
      </div>
    `;

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev',
      to: email,
      subject: `Mã QR Check-in - ${eventName}`,
      html: htmlContent,
    });

    return response;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendBulkQRCodeEmails(
  participants: Array<{
    email: string;
    name: string;
    qrCode: string;
  }>,
  eventName: string
) {
  const results = await Promise.allSettled(
    participants.map(async (participant) => {
      return sendQRCodeEmail(
        participant.email,
        participant.name,
        participant.qrCode,
        eventName
      );
    })
  );

  return {
    total: participants.length,
    successful: results.filter((r) => r.status === 'fulfilled').length,
    failed: results.filter((r) => r.status === 'rejected').length,
  };
}
