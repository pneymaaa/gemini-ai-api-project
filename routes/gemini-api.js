import express from "express";
import multer from "multer";
import fs from "fs"; 
import path from "path";
import dotenv from 'dotenv';
import { fileURLToPath } from "url";
import { GoogleGenAI, Modality } from '@google/genai';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express();
const uploadDir = path.join(__dirname, "../public/uploads");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const model = 'gemini-1.5-flash';

// Buat folder uploads kalau belum ada
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filePath = path.join(uploadDir, file.originalname);

    //Jika file sudah ada, hapus dulu
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

/**
 * Helper untuk convert file ke base64
 */
const fileToBase64 = (filePath) =>
  new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString("base64"));
    });
  });

/**
 * Generate text only
 */
router.post('/generate-text', upload.none(), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required and must be a string' });
    }

    const result = await genAI.models.generateContent({
      model,
      contents: prompt,
    });

    if (!result.candidates?.length || !result.candidates[0].content?.parts) {
      return res.status(500).json({ success: false, error: 'No valid output from model' });
    }

    const outputs = result.candidates[0].content.parts
      .filter((part) => part.text)
      .map((part) => part.text);

    const output = outputs[0] || '';

    res.status(200).json({ success: true, output: output });
    
  } catch (error) {
    next(error);
  }
});

/**
 * Generate from image
 */
router.post('/generate-from-image', upload.single('image'), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required and must be a string' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Image file is required' });
    }

    if (!['image/png', 'image/jpeg'].includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, error: 'Only PNG or JPEG images are allowed' });
    }

    const base64Image = await fileToBase64(req.file.path);

    const contents = [
      { text: prompt },
      { inlineData: { mimeType: req.file.mimetype, data: base64Image } },
    ];

    const result = await genAI.models.generateContent({
      model,
      contents,
      config: { responseModalities: [Modality.TEXT] },
    });

    if (!result.candidates?.length || !result.candidates[0].content?.parts) {
      return res.status(500).json({ success: false, error: 'No valid output from model' });
    }

    const outputs = result.candidates[0].content.parts
      .filter((part) => part.text)
      .map((part) => part.text);

    const output = outputs[0] || '';

    res.status(200).json({ success: true, output: output });

  } catch (error) {
    next(error);
  } 
  finally {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
  }
});

/**
 * Generate from document
 */
router.post('/generate-from-document', upload.single('document'), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required and must be a string' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Document file is required' });
    }

    if (![
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ].includes(req.file.mimetype)) {
            return res.status(400).json({ success: false, error: 'Only PDF, DOC, DOCX, TXT, XLS, or XLSX files are allowed' });
    }

    const base64Document = await fileToBase64(req.file.path);

    const contents = [
      { text: prompt },
      { inlineData: { mimeType: req.file.mimetype, data: base64Document } },
    ];

    const result = await genAI.models.generateContent({
      model,
      contents,
      config: { responseModalities: [Modality.TEXT] },
    });

    if (!result.candidates?.length || !result.candidates[0].content?.parts) {
      return res.status(500).json({ success: false, error: 'No valid output from model' });
    }

    const outputs = result.candidates[0].content.parts
      .filter((part) => part.text)
      .map((part) => part.text);

    const output = outputs[0] || '';

    res.status(200).json({ success: true, output: output });

  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
  }
});

/**
 * Generate from audio
 */
router.post('/generate-from-audio', upload.single('audio'), async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt is required and must be a string' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Audio file is required' });
    }

    if (!['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'].includes(req.file.mimetype)) {
        return res.status(400).json({ success: false, error: 'Only MP3, WAV, OGG, WEBM, or M4A audio files are allowed' });
    }

    const base64Audio = await fileToBase64(req.file.path);

    const contents = [
      { text: prompt },
      { inlineData: { mimeType: req.file.mimetype, data: base64Audio } },
    ];

    const result = await genAI.models.generateContent({
      model,
      contents,
      config: { responseModalities: [Modality.TEXT] },
    });

    if (!result.candidates?.length || !result.candidates[0].content?.parts) {
      return res.status(500).json({ success: false, error: 'No valid output from model' });
    }

    const outputs = result.candidates[0].content.parts
      .filter((part) => part.text)
      .map((part) => part.text);

    const output = outputs[0] || '';

    res.status(200).json({ success: true, output: output });
  } catch (error) {
    next(error);
  } finally {
    if (req.file?.path) {
      try {
        await fs.unlink(req.file.path);
      } catch {}
    }
  }
});

export default router;
