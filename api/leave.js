const { google } = require('googleapis');

// 授權並初始化 Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const spreadsheetId = process.env.GOOGLE_SHEET_ID;
const leaveSheetName = '請假記錄'; // 請假記錄工作表

export default async function handler(req, res) {
  
  // 處理讀取請假記錄的請求 (GET)
  if (req.method === 'GET') {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: leaveSheetName,
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
  // 處理新增請假記錄的請求 (POST)
  else if (req.method === 'POST') {
    try {
      const leaveRequest = req.body;
      
      // 檢查是否已存在請假記錄工作表，如果不存在則創建
      try {
        await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${leaveSheetName}!1:1`
        });
      } catch (sheetError) {
        // 工作表不存在，創建新工作表
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [{
              addSheet: {
                properties: {
                  title: leaveSheetName
                }
              }
            }]
          }
        });
      }

      const headers = (await sheets.spreadsheets.values.get({ 
        spreadsheetId, 
        range: `${leaveSheetName}!1:1` 
      })).data.values;
      
      let values = [];
      // 如果工作表是空的，先建立標頭
      if (!headers || headers.length === 0) {
          const headerRow = ['date', 'type', 'reason', 'submittedAt', 'status'];
          await sheets.spreadsheets.values.append({
              spreadsheetId,
              range: leaveSheetName,
              valueInputOption: 'USER_ENTERED',
              resource: { values: [headerRow] },
          });
          values.push([
            leaveRequest.date || '',
            leaveRequest.type || '',
            leaveRequest.reason || '',
            leaveRequest.submittedAt || '',
            'active'
          ]);
      } else {
          values.push([
            leaveRequest.date || '',
            leaveRequest.type || '',
            leaveRequest.reason || '',
            leaveRequest.submittedAt || '',
            'active'
          ]);
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: leaveSheetName,
        valueInputOption: 'USER_ENTERED',
        resource: { values },
      });

      res.status(200).json({ success: true, message: 'Leave request added successfully.' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  } 
  // 處理不支援的請求方法
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}