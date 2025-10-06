import React, { useState } from 'react';
import { processImage } from '../api';

function UploadForm({ setResultUrl }) {
  const [file, setFile] = useState(null);
  const [watermark, setWatermark] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !watermark) {
      setError('Please select an image and enter watermark text.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await processImage(file, watermark);
      setResultUrl(data.url);
    } catch (err) {
      setError('Failed to process image.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <div>
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
      </div>
      <div style={{ margin: '12px 0' }}>
        <input
          type="text"
          placeholder="Watermark text"
          value={watermark}
          onChange={e => setWatermark(e.target.value)}
        />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Processing...' : 'Add Watermark'}</button>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </form>
  );
}

export default UploadForm;
