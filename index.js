import express from 'express';
import cors from 'cors';
import geminiApiRoutes from './routes/gemini-api.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/gemini-api', geminiApiRoutes);

// Error Handler
const errorHandler = (err, req, res, next) => {
  console.error(err); // logging
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
};

app.use(errorHandler);

export default app;
