import app from './app.js';

// Local development entry point. On Vercel the app runs as a serverless function (api/index.js).
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
