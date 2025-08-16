import http from 'http';
import app from './index.js';
import dotenv from 'dotenv';

dotenv.config();

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Gemini API server is running at http://localhost:${PORT}`)
});