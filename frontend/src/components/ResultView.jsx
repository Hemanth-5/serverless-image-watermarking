import React from 'react';

function ResultView({ url }) {
  return (
    <div style={{ marginTop: 32 }}>
      <h2>Processed Image</h2>
      <img src={url} alt="Processed" style={{ maxWidth: '100%' }} />
      <div style={{ marginTop: 12 }}>
        <a href={url} download target="_blank" rel="noopener noreferrer">Download Image</a>
      </div>
    </div>
  );
}

export default ResultView;
