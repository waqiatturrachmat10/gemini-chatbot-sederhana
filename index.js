import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();

// Configure multer to use memory storage so we can access file buffers
const upload = multer(); 

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Set default model
const GEMINI_MODEL = "gemini-2.5-flash";

// --- MIDDLEWARE ---
app.use(express.json());
// BARIS PENTING: Agar file di folder 'public' (index.html)
app.use(express.static('public')); 


// --- 1. Generate Text Endpoint ---
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// --- 2. Generate from Document Endpoint ---
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ message: "No document uploaded" });

    const base64Document = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { 
                    text: prompt ?? "Tolong buat ringkasan dari dokumen berikut.", 
                    type: "text" 
                },
                { 
                    inlineData: { data: base64Document, mimeType: req.file.mimetype } 
                }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// --- 3. Generate from Image Endpoint ---
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ message: "No image uploaded" });

    const base64Image = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: prompt, type: "text" }, 
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// --- 4. Generate from Audio Endpoint ---
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    const { prompt } = req.body;
    if (!req.file) return res.status(400).json({ message: "No audio uploaded" });

    const base64Audio = req.file.buffer.toString("base64");

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { 
                    text: prompt ?? "Tolong buatkan transkrip dari rekaman berikut.", 
                    type: "text" 
                },
                { 
                    inlineData: { data: base64Audio, mimeType: req.file.mimetype } 
                }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// --- 5. Endpoint Chatbot Web (Untuk Frontend) ---
app.post('/api/chat', async (req, res) => {
    try {
        const { conversation } = req.body;
        const userMessage = conversation[0].content; // Ambil pesan user

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: userMessage
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));