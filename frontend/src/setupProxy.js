const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/.netlify/functions',
    createProxyMiddleware({
      target: 'http://localhost:9999',
      changeOrigin: true,
      pathRewrite: {
        '^/.netlify/functions': '/.netlify/functions'
      },
      logLevel: 'debug'
    })
  );
};
