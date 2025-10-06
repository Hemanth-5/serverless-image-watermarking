# Serverless Image Watermarking

A simple app to add watermarks to images using React, Netlify Functions, and Cloudinary.

## Project Structure

```
serverless-image-watermarking/
│
├── frontend/                # React frontend
│   ├── public/              # Static assets
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── App.jsx          # Main app
│   │   ├── api.js           # API calls
│   │   └── index.js         # Entry point
│   └── package.json         # Frontend dependencies
│
├── netlify/                 # Netlify-specific configs
│   ├── functions/           # Netlify Functions
│   │   └── process-image.js # Serverless function
│   └── netlify.toml         # Netlify config
│
├── .gitignore
├── .env                     # Cloudinary API keys (see below)
├── README.md
└── package.json             # Monorepo root
```

## Setup

1. **Clone the repo**
2. **Install dependencies**
   ```bash
   cd frontend && npm install
   ```
3. **Set up Cloudinary**
   - Create a `.env` file in the root:
     ```env
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     ```
4. **Run locally**
   - Start the React app:
     ```bash
     cd frontend && npm start
     ```
   - Use Netlify CLI to run functions locally (optional):
     ```bash
     npm install -g netlify-cli
     netlify dev
     ```

## Deploy

- Deploy to Netlify and set environment variables in the Netlify dashboard.

## Usage

- Upload an image, enter watermark text, and get a processed image with a watermark.

---

**Built with React, Netlify Functions, and Cloudinary.**