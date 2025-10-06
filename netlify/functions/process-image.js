const cloudinary = require('cloudinary').v2;
const Busboy = require('busboy');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }

  return new Promise((resolve) => {
    const busboy = Busboy({ 
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    let watermark = '';
    let imageBuffer = null;
    let imageMimeType = '';

    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'watermark') {
        watermark = value;
      }
    });

    busboy.on('file', (fieldname, file, info) => {
      if (fieldname === 'image') {
        const { mimeType } = info;
        imageMimeType = mimeType;
        const chunks = [];
        
        file.on('data', (data) => {
          chunks.push(data);
        });
        
        file.on('end', () => {
          imageBuffer = Buffer.concat(chunks);
        });
      }
    });

    busboy.on('finish', async () => {
      try {
        if (!imageBuffer) {
          resolve({
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No image provided' })
          });
          return;
        }

        if (!watermark) {
          resolve({
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'No watermark text provided' })
          });
          return;
        }

        // Convert buffer to base64 and upload to Cloudinary
        const base64Image = `data:${imageMimeType};base64,${imageBuffer.toString('base64')}`;
        
        const uploadRes = await cloudinary.uploader.upload(base64Image, {
          folder: 'watermarked_uploads',
        });

        // Generate watermarked image URL using text overlay
        const url = cloudinary.url(uploadRes.public_id, {
          transformation: [
            { 
              overlay: { 
                font_family: 'Arial', 
                font_size: 60, 
                text: watermark 
              }, 
              gravity: 'south_east', 
              x: 20, 
              y: 20, 
              color: '#ffffff',
              opacity: 70
            },
          ],
          secure: true,
        });

        resolve({
          statusCode: 200,
          headers,
          body: JSON.stringify({ url })
        });
      } catch (error) {
        console.error('Error processing image:', error);
        resolve({
          statusCode: 500,
          headers,
          body: JSON.stringify({ 
            error: 'Failed to process image', 
            details: error.message 
          })
        });
      }
    });

    // Parse the body
    const body = event.isBase64Encoded 
      ? Buffer.from(event.body, 'base64') 
      : Buffer.from(event.body);
    
    busboy.write(body);
    busboy.end();
  });
};
