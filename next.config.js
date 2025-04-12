/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Environment variables configuration
  env: {
    RUNPOD_ENDPOINT_ID: process.env.RUNPOD_ENDPOINT_ID,
    RUNPOD_API_KEY: process.env.RUNPOD_API_KEY,
  },

  // Your existing CORS headers configuration
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

// Add some basic validation for required environment variables
if (!process.env.RUNPOD_API_KEY || !process.env.RUNPOD_ENDPOINT_ID) {
  console.warn(
    '\x1b[33m%s\x1b[0m', // Yellow color for warning
    'Warning: Missing RunPod configuration. Make sure to set RUNPOD_API_KEY and RUNPOD_ENDPOINT_ID in your environment variables.'
  );
}

module.exports = nextConfig;