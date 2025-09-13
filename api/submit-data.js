// /api/submit-data.js

const { google } = require('googleapis');

export default async function handler(req, res) {
  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  try {
    const body = req.body; // 這是從你前端傳來的資料

    // *** 這裡才是安全使用金鑰的地方 ***
    // Vercel 的環境變數在後端 (Serverless Function) 中是安全的，不會外洩到前端
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 非常重要：處理換行符
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID, // 你需要設定表單 ID
      range: '工作表1!A1', // 你要寫入的範圍
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [
          // 將前端傳來的資料整理成陣列
          [body.dateTime, body.duration, body.type, body.details] 
        ],
      },
    });

    res.status(200).json({ message: 'Success' });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
}
