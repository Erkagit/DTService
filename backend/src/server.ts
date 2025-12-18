import app from './app';

const PORT = process.env.PORT || 5050;

// Only listen when not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  });
}

// Export for Vercel serverless
export default app;
