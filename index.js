const express = require('express');
const app = express();

const geminiApiRoutes = require('./routes/gemini-api');

app.use(express.json());
app.use(cors());

app.use('/gemini-api', geminiApiRoutes);

module.exports = app;