
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();
//const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI, Modality, Mode } = require('@google/genai');

const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const model = 'gemini-1.5-flash';
//const model = genAI.getGenerativeModel({model: 'models/gemini-1.5-flash'});
//const model = genAI.models.generateContent({model: 'models/gemini-1.5-flash'});
const upload = multer({dest: 'uploads/'});


router.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: prompt
        });
        res.json({ output: response.text });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

router.post('/generate-from-image', upload.single('image'), async(req,res)=> {
    const prompt = req.body.prompt || 'Describe the image';
    const imagePath = req.file.path;
    const imageData = fs.readFileSync(imagePath);
    const base64Image = imageData.toString("base64");

    const contents = [
        {text: prompt},
        {inlineData: {
            mimeType: 'image/png',
            data: base64Image
        }}
    ]

    try {
        const response = await genAI.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseModalities: [Modality.TEXT]
            }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.text) {
                res.json({ output: part.text, part: part });
            }
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    } finally {
        fs.unlinkSync(imagePath);
    }
})

router.post('/generative-from-document', upload.single('document'), async(req, res)=>{
    const prompt = req.body.prompt || 'Analyze this document';
    const filePath = req.file.path;
    const buffer = fs.readFileSync(filePath);
    const base64Data = buffer.toString('base64');
    const mimeType = req.file.mimetype;

    try {
        const documentPart = {
            inlineData: { data: base64Data, mimeType }
        };

        const result = await model.generateContent([prompt, documentPart]);
        const response = await result.response;
        res.json({output: response.text()});
    } catch (error) {
        res.status(500).json({error: error.message});
    } finally {
        fs.unlinkSync(filePath);
    }
})

router.post('/generate-from-audio', upload.single('audio'), async(req,res) => {
    const prompt = req.body.prompt || 'Transcribe or analyze the following audio:';
    const filePath = req.file.path;
    const audioBuffer = fs.readFileSync(filePath);
    const base64Audio = audioBuffer.toString('base64');
    const mimeType = req.file.mimetype;
    const audioPart = {
        inlineData: {data: base64Audio, mimeType: mimeType }
    }

    try {
        const result = await model.generateContent([prompt, audioPart]);
        const response = await result.response;
        res.json({output: response.text()});
    } catch (error) {
        res.status(500).json({error: error.message});
    } finally {
        fs.unlinkSync(filePath);
    }
})

module.exports = router;