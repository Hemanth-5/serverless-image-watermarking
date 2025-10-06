import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Alert, 
  LinearProgress,
  Stack,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import { CloudUpload, AutoAwesome, Palette, LocationOn, Style, RotateRight } from '@mui/icons-material';
import { processImage } from '../api';

function UploadForm({ setResultUrl }) {
  const [file, setFile] = useState(null);
  const [watermark, setWatermark] = useState('');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkPosition, setWatermarkPosition] = useState('south_east');
  const [watermarkStyle, setWatermarkStyle] = useState('single');
  const [watermarkAngle, setWatermarkAngle] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [watermarkPreview, setWatermarkPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setShowPreview(false);
        setWatermarkPreview(null);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
      setShowPreview(false);
      setWatermarkPreview(null);
    }
  };

  const generatePreview = () => {
    if (!preview || !watermark) {
      setError('Please select an image and enter watermark text first.');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Set watermark style
      ctx.font = `${watermarkStyle === 'repeated' ? 35 : 60}px Arial`;
      ctx.fillStyle = watermarkColor;
      ctx.globalAlpha = watermarkStyle === 'repeated' ? 0.4 : 0.7;

      if (watermarkStyle === 'repeated') {
        // Draw repeated watermarks in a grid
        const positions = [
          { x: canvas.width * 0.15, y: canvas.height * 0.15 },
          { x: canvas.width * 0.5, y: canvas.height * 0.15 },
          { x: canvas.width * 0.85, y: canvas.height * 0.15 },
          { x: canvas.width * 0.15, y: canvas.height * 0.5 },
          { x: canvas.width * 0.5, y: canvas.height * 0.5 },
          { x: canvas.width * 0.85, y: canvas.height * 0.5 },
          { x: canvas.width * 0.15, y: canvas.height * 0.85 },
          { x: canvas.width * 0.5, y: canvas.height * 0.85 },
          { x: canvas.width * 0.85, y: canvas.height * 0.85 }
        ];

        positions.forEach(pos => {
          ctx.save();
          ctx.translate(pos.x, pos.y);
          ctx.rotate((watermarkAngle * Math.PI) / 180);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(watermark, 0, 0);
          ctx.restore();
        });
      } else {
        // Draw single watermark based on position
        let x, y;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';

        switch (watermarkPosition) {
          case 'north_west':
            x = 20; y = 20;
            break;
          case 'north':
            x = canvas.width / 2;
            y = 20;
            ctx.textAlign = 'center';
            break;
          case 'north_east':
            x = canvas.width - 20;
            y = 20;
            ctx.textAlign = 'right';
            break;
          case 'west':
            x = 20;
            y = canvas.height / 2;
            ctx.textBaseline = 'middle';
            break;
          case 'center':
            x = canvas.width / 2;
            y = canvas.height / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            break;
          case 'east':
            x = canvas.width - 20;
            y = canvas.height / 2;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            break;
          case 'south_west':
            x = 20;
            y = canvas.height - 20;
            ctx.textBaseline = 'bottom';
            break;
          case 'south':
            x = canvas.width / 2;
            y = canvas.height - 20;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            break;
          case 'south_east':
          default:
            x = canvas.width - 20;
            y = canvas.height - 20;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
        }

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((watermarkAngle * Math.PI) / 180);
        ctx.fillText(watermark, 0, 0);
        ctx.restore();
      }

      // Convert canvas to data URL and set as preview
      setWatermarkPreview(canvas.toDataURL());
      setShowPreview(true);
      setError('');
    };

    img.src = preview;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !watermark) {
      setError('Please select an image and enter watermark text.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const options = {
        watermarkColor,
        watermarkPosition,
        watermarkStyle,
        watermarkAngle: watermarkAngle.toString()
      };
      const data = await processImage(file, watermark, options);
      setResultUrl(data.url);
      setError('');
    } catch (err) {
      setError('Failed to process image. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
      <Stack spacing={3}>
        {preview && (
          <Card elevation={0} sx={{ bgcolor: 'grey.50', border: '1px solid', borderColor: 'grey.200' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Image Preview
              </Typography>
              <Box 
                component="img" 
                src={preview} 
                alt="Preview" 
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: 300, 
                  display: 'block',
                  mx: 'auto',
                  borderRadius: 1
                }} 
              />
              <Chip 
                label={file?.name} 
                size="small" 
                sx={{ mt: 1 }}
                color="primary"
                variant="outlined"
              />
            </CardContent>
          </Card>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          size="large"
          fullWidth
          sx={{ py: 2 }}
        >
          {file ? 'Change Image' : 'Select Image'}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>

        <TextField
          fullWidth
          label="Watermark Text"
          placeholder="Enter your watermark text"
          value={watermark}
          onChange={(e) => setWatermark(e.target.value)}
          variant="outlined"
          required
        />

        <Divider>
          <Chip label="Customize Watermark" icon={<Style />} />
        </Divider>

        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Watermark Style</InputLabel>
                <Select
                  value={watermarkStyle}
                  label="Watermark Style"
                  onChange={(e) => setWatermarkStyle(e.target.value)}
                  startAdornment={<Style sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="single">Single Watermark</MenuItem>
                  <MenuItem value="repeated">Repeated Pattern</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Position</InputLabel>
                <Select
                  value={watermarkPosition}
                  label="Position"
                  onChange={(e) => setWatermarkPosition(e.target.value)}
                  disabled={watermarkStyle === 'repeated'}
                  startAdornment={<LocationOn sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="north_west">Top Left</MenuItem>
                  <MenuItem value="north">Top Center</MenuItem>
                  <MenuItem value="north_east">Top Right</MenuItem>
                  <MenuItem value="west">Middle Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="east">Middle Right</MenuItem>
                  <MenuItem value="south_west">Bottom Left</MenuItem>
                  <MenuItem value="south">Bottom Center</MenuItem>
                  <MenuItem value="south_east">Bottom Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Palette /> Watermark Color
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    style={{
                      width: '60px',
                      height: '40px',
                      border: '2px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  />
                  <TextField
                    size="small"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    placeholder="#ffffff"
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box>
                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RotateRight /> Rotation Angle: {watermarkAngle}°
                </Typography>
                <Slider
                  value={watermarkAngle}
                  onChange={(e, newValue) => setWatermarkAngle(newValue)}
                  min={-45}
                  max={45}
                  step={5}
                  marks
                  valueLabelDisplay="auto"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {showPreview && watermarkPreview && (
          <Card elevation={2} sx={{ bgcolor: 'info.light', border: '2px solid', borderColor: 'info.main' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="info.dark" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesome /> Watermark Preview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This is how your watermarked image will look. Click "Apply Watermark" to process.
              </Typography>
              <Box 
                component="img" 
                src={watermarkPreview} 
                alt="Watermark Preview" 
                sx={{ 
                  maxWidth: '100%', 
                  maxHeight: 400, 
                  display: 'block',
                  mx: 'auto',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }} 
              />
            </CardContent>
          </Card>
        )}

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            disabled={!file || !watermark}
            onClick={generatePreview}
            startIcon={<AutoAwesome />}
            sx={{ py: 1.5 }}
          >
            Preview Watermark
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || !file || !watermark}
            startIcon={<CloudUpload />}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Processing...' : 'Apply Watermark'}
          </Button>
        </Stack>

        {loading && <LinearProgress />}

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export default UploadForm;
