exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { email, segments } = JSON.parse(event.body);
    const FLODESK_API_KEY = process.env.FLODESK_API_KEY;

    const response = await fetch('https://api.flodesk.com/v1/subscribers', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(FLODESK_API_KEY + ':').toString('base64'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, segment_ids: segments })
    });

    const data = await response.json();
    console.log('Flodesk response:', JSON.stringify(data));

    return {
      statusCode: response.ok ? 200 : response.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
