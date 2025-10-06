import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardMedia, 
  Button, 
  Typography,
  Stack,
  Divider
} from '@mui/material';
import { Download, CheckCircle } from '@mui/icons-material';

function ResultView({ url }) {
  return (
    <Box sx={{ mt: 4 }}>
      <Divider sx={{ mb: 3 }}>
        <CheckCircle color="success" sx={{ mr: 1 }} />
        <Typography variant="h6" color="success.main" component="span">
          Success!
        </Typography>
      </Divider>
      
      <Card elevation={2} sx={{ borderRadius: 2 }}>
        <CardMedia
          component="img"
          image={url}
          alt="Processed with watermark"
          sx={{ maxHeight: 500, objectFit: 'contain', bgcolor: 'grey.100' }}
        />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h6" color="primary">
              Your Watermarked Image
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your image has been successfully processed with the watermark. Download it below.
            </Typography>
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<Download />}
              component="a"
              href={url}
              download
              target="_blank"
              rel="noopener noreferrer"
              sx={{ py: 1.5 }}
            >
              Download Image
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ResultView;
