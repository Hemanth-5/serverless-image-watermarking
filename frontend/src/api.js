import axios from 'axios';

export async function processImage(file, watermark) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('watermark', watermark);
  const res = await axios.post('/.netlify/functions/process-image', formData);
  return res.data;
}
