import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Container, Box, Typography, Paper, CssBaseline, AppBar, Toolbar } from '@mui/material';
import { WaterDrop } from '@mui/icons-material';
import UploadForm from './components/UploadForm';
import ResultView from './components/ResultView';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 700,
    },
  },
});

function App() {
  const [resultUrl, setResultUrl] = useState(null);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <WaterDrop sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Serverless Image Watermarking
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom color="primary">
              Add Watermark to Your Images
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Upload an image and add custom watermark text using our serverless processing
            </Typography>
          </Box>
          <UploadForm setResultUrl={setResultUrl} />
          {resultUrl && <ResultView url={resultUrl} />}
        </Paper>
      </Container>
    </ThemeProvider>
  );
}

export default App;
