import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import ResultView from './components/ResultView';

function App() {
  const [resultUrl, setResultUrl] = useState(null);
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Serverless Image Watermarking</h1>
      <UploadForm setResultUrl={setResultUrl} />
      {resultUrl && <ResultView url={resultUrl} />}
    </div>
  );
}

export default App;
