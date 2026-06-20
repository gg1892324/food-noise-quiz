const https = require('https');

const SEGMENT_MAP = {
  'mild general':    '6a2deb0fcafef68ebc315863',
  'moderate general':'6a2deb209b9f291e79c45b39',
  'severe general':  '6a2deb357641abb782aa1c5c',
  'mild glp1':       '6a2deb5a20472b51bd629e58',
  'moderate glp1':   '6a2deb657641abb782aa1c5d',
  'severe glp1':     '6a2deb739b9f291e79c45b3b',
  'mild adhd':       '6a2f6e49832e89ad13bdf347',
  'moderate adhd':   '6a2f6e546fb8f4165014f71f',
  'severe adhd':     '6a2f6e5c9b9f291e79c4632d',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { email, segment } = JSON.parse(event.body);
    const API_KEY = process.env.FLODESK_API_KEY;

    const segmentId = SEGMENT_MAP[segment];
    const payload = JSON.stringify({
      email,
      ...(segmentId ? { segment_ids: [segmentId] } : {})
    });

    const data = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.flodesk.com',
        path: '/v1/subscribers',
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(API_KEY + ':').toString('base64'),
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body }));
      });
      req.on('error', reject);
      req.write(payload);
      req.end();
    });

    return {
      statusCode: data.status === 200 || data.status === 201 ? 200 : data.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: data.body
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
