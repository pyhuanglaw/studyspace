const { google } = require('googleapis');

// 授權並初始化 Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // 確保私鑰格式正確
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const sheetName = '工作表1'; // 預設工作表名稱，如果使用者的不是這個，他們需要自行修改

// Vercel 將執行的主要函式
export default async function handler(req, res) {
  
  // 處理讀取歷史紀錄的請求 (GET)
  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: sheetName,
      });
      
      const rows = response.data.values || [];
      if (rows.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }

      const headers = rows.shift();
      const data = rows.map(row => {
        let record = {};
        headers.forEach((header, index) => {
          record[header] = row[index];
        });
        return record;
      });

      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
  // 處理新增紀錄的請求 (POST)
  else if (req.method === 'POST') {
    try {
      // Vercel 會自動解析 JSON body，所以我們直接用 req.body
      const record = req.body; 
      const headers = (await sheets.spreadsheets.values.get({ spreadsheetId, range: `${sheetName}!1:1` })).data.values;
      
      let values = [];
      // 如果試算表是空的，先建立標頭
      if (!headers) {
          const headerRow = ['date', 'period', 'startTime', 'endTime', 'duration', 'durationSeconds'];
          await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: sheetName,
              valueInputOption: 'USER_ENTERED',
              resource: { values: [headerRow] },
          });
          values.push(headerRow.map(header => record[header] || null));
      } else {
          values.push(headers[0].map(header => record[header] || null));
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      res.status(200).json({ success: true, message: 'Record added successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, receivedBody: req.body });
    }
  } 
  // 處理不支援的請求方法
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}