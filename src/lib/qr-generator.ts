import QRCode from 'qrcode';

export async function generateQRCode(text: string): Promise<string> {
  try {
    const qrDataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function generateParticipantQRCode(participantId: string): string {
  // Format: SYSTEM_v1|participantId|timestamp
  return `CHECKIN_v1|${participantId}|${Date.now()}`;
}
