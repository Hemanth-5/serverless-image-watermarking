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
    let watermarkColor = '#ffffff';
    let watermarkPosition = 'south_east';
    let watermarkStyle = 'single';
    let watermarkAngle = '0';
    let imageBuffer = null;
    let imageMimeType = '';

    busboy.on('field', (fieldname, value) => {
      if (fieldname === 'watermark') {
        watermark = value;
      } else if (fieldname === 'watermarkColor') {
        watermarkColor = value;
      } else if (fieldname === 'watermarkPosition') {
        watermarkPosition = value;
      } else if (fieldname === 'watermarkStyle') {
        watermarkStyle = value;
      } else if (fieldname === 'watermarkAngle') {
        watermarkAngle = value;
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
        
        // Upload the original first
        const uploadRes = await cloudinary.uploader.upload(base64Image, {
          folder: 'watermarked_images',
          public_id: `watermarked_${Date.now()}`,
        });
        
        // Build transformation based on watermark style
        let transformation = [];
        
        // Format color properly (remove # and convert to rgb format)
        const colorFormatted = watermarkColor.replace('#', 'rgb:');
        
        if (watermarkStyle === 'repeated') {
          // Create tiled/repeated watermark effect using multiple overlays
          // We'll create a grid pattern by positioning watermarks at different locations
          const positions = [
            { gravity: 'north_west', x: 50, y: 50 },
            { gravity: 'north', x: 0, y: 50 },
            { gravity: 'north_east', x: 50, y: 50 },
            { gravity: 'west', x: 50, y: 0 },
            { gravity: 'center', x: 0, y: 0 },
            { gravity: 'east', x: 50, y: 0 },
            { gravity: 'south_west', x: 50, y: 50 },
            { gravity: 'south', x: 0, y: 50 },
            { gravity: 'south_east', x: 50, y: 50 }
          ];
          
          // Add watermark at each position
          positions.forEach(pos => {
            transformation.push({
              overlay: {
                font_family: 'Arial',
                font_size: 35,
                text: watermark
              },
              gravity: pos.gravity,
              x: pos.x,
              y: pos.y,
              angle: parseInt(watermarkAngle) || 0,
              color: colorFormatted,
              opacity: 40
            });
          });
        } else {
          // Single watermark at specified position
          transformation = [{
            overlay: {
              font_family: 'Arial',
              font_size: 60,
              text: watermark
            },
            gravity: watermarkPosition,
            x: 20,
            y: 20,
            angle: parseInt(watermarkAngle) || 0,
            color: colorFormatted,
            opacity: 70
          }];
        }

        // Apply transformation using explicit API
        const transformedResult = await cloudinary.uploader.explicit(uploadRes.public_id, {
          type: 'upload',
          eager: [{ transformation: transformation }]
        });

        const url = transformedResult.eager[0].secure_url;

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
