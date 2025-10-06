import axios from 'axios';

export async function processImage(file, watermark, options = {}) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('watermark', watermark);
  formData.append('watermarkColor', options.watermarkColor || '#ffffff');
  formData.append('watermarkPosition', options.watermarkPosition || 'south_east');
  formData.append('watermarkStyle', options.watermarkStyle || 'single');
  formData.append('watermarkAngle', options.watermarkAngle || '0');
  const res = await axios.post('/.netlify/functions/process-image', formData);
  return res.data;
}
