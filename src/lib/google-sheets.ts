import { google } from 'googleapis';

const sheets = google.sheets('v4');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export async function syncParticipantsFromSheet(spreadsheetId: string) {
  try {
    const result = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Participants!A2:G1000',
    });

    const rows = result.data.values || [];
    return rows.map((row: any[]) => ({
      id: row,
      name: row,
      unit: row,
      position: row,
      email: row,
      qrCode: row,
      createdAt: row,
    }));
  } catch (error) {
    console.error('Error syncing from Google Sheets:', error);
    throw error;
  }
}

export async function updateSheetCheckin(
  spreadsheetId: string,
  eventName: string,
  participantEmail: string,
  status: string,
  timestamp: string
) {
  try {
    const values = [[participantEmail, status, timestamp]];

    await sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${eventName}!A:C`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return true;
  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    throw error;
  }
}

export async function getParticipantFromSheet(
  spreadsheetId: string,
  qrCode: string
) {
  try {
    const result = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: 'Participants!A2:G1000',
    });

    const rows = result.data.values || [];
    return rows.find((row: any[]) => row === qrCode);
  } catch (error) {
    console.error('Error getting participant:', error);
    throw error;
  }
}
