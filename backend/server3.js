// server.js - Complete Server Implementation with Advanced AI Integration

// Import required dependencies
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const crypto = require('crypto');

// Initialize environment
console.log('Starting server setup...');
dotenv.config();

// Set ElevenLabs API key
process.env.ELEVENLABS_API_KEY = 'cf2c944c76bd3923493931902fa1c7de42e83bb9c5803225e09bc9431968b239';
console.log('Environment variables loaded successfully');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize AI models (disabled for testing)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'disabled');
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// AI Service Class
class AIService {
    static async generateImagePrompt(brandName, type, context) {
        try {
            const prompt = `Create a detailed prompt for DALL-E to generate a ${type} image for the brand "${brandName}".
            Context: ${context}
            Include specific details about:
            1. Main subject and composition
            2. Colors and lighting
            3. Style and mood
            4. Key visual elements
            5. Background elements
            Make it photorealistic and suitable for commercial use.`;

            const result = await textModel.generateContent(prompt);
            return result.response.text().trim();
        } catch (error) {
            console.error('Error generating image prompt:', error);
            return `Professional ${type} image for ${brandName} with modern design, clear composition, and brand-appropriate elements.`;
        }
    }

    static async generateImage(prompt, size = "1024x1024") {
        try {
            console.log('Generating image with DALL-E 3:', prompt.substring(0, 100) + '...');
            
            const response = await axios({
                method: 'post',
                url: 'https://api.openai.com/v1/images/generations',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    model: "dall-e-3",
                    prompt: prompt,
                    n: 1,
                    size: size,
                    quality: "standard",
                    style: "natural"
                }
            });

            return response.data.data[0].url;
        } catch (error) {
            console.error('DALL-E Error:', error.response?.data || error.message);
            throw new Error('Image generation failed');
        }
    }

    static async generateVoice(text, voiceId = 'ThT5KcBeYPX3keUQqHPh', modelId = 'eleven_monolingual_v1') {
        try {
            console.log('Generating voice with ElevenLabs:', text.substring(0, 100) + '...');
            
            const response = await axios({
                method: 'post',
                url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                data: {
                    text: text,
                    model_id: modelId,
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75,
                        style: 0.5,
                        use_speaker_boost: true
                    }
                },
                responseType: 'arraybuffer'
            });

            const audioBase64 = Buffer.from(response.data).toString('base64');
            return `data:audio/mpeg;base64,${audioBase64}`;
        } catch (error) {
            console.error('ElevenLabs Error:', error.response?.data || error.message);
            throw new Error('Voice generation failed');
        }
    }
}

// Test route for ElevenLabs
app.get('/api/check-elevenlabs', async (req, res) => {
    try {
        console.log('Testing ElevenLabs integration...');
        
        // First verify the API key
        const voicesResponse = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'Accept': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            }
        });
        
        // Then generate a test voice clip
        const testText = "Hello! This is a test of the ElevenLabs voice synthesis.";
        const audioData = await AIService.generateVoice(testText);
        
        return res.json({ 
            success: true, 
            audioData,
            voiceCount: voicesResponse.data.voices?.length || 0
        });
    } catch (error) {
        console.error('ElevenLabs Test Error:', error);
        return res.status(500).json({
            error: 'ElevenLabs test failed',
            details: error.message
        });
    }
});

// Main API Route
app.post('/api/generate', async (req, res) => {
    try {
        const { brandName, brandInfo, imageType } = req.body;
        if (!brandName || !brandInfo || !imageType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Step 1: Generate brand description
        const descriptionPrompt = `Create a professional and engaging brand description for "${brandName}". 
        Use this context: ${brandInfo}
        Make it sound natural and compelling, highlighting key brand values and unique selling points.
        Keep it concise but impactful, around 2-3 sentences.`;

        const descriptionResult = await textModel.generateContent(descriptionPrompt);
        const brandDescription = descriptionResult.response.text().trim();
        console.log('Generated brand description:', brandDescription);

        // Step 2: Generate voice
        const audioData = await AIService.generateVoice(brandDescription);
        console.log('Generated audio data successfully');

        return res.json({
            success: true,
            description: brandDescription,
            audioData
        });

    } catch (error) {
        console.error('Error in /api/generate:', error);
        return res.status(500).json({
            error: 'Generation failed',
            details: error.message
        });
    }
});

// Health Check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        elevenlabs: 'configured'
    });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server initialization complete. Ready to handle requests.');
});
