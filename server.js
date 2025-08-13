const http = require('http');
const app = require('./index');
const dotenv = require('dotenv');
dotenv.config();

const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Gemini API server is running at http://localhost:${PORT}`)
});