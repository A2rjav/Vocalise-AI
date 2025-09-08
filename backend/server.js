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

// Note: Some API keys are disabled for testing
// const requiredKeys = ['GEMINI_API_KEY', 'OPENAI_API_KEY'];
// for (const key of requiredKeys) {
//     if (!process.env[key]) {
//         console.error(`ERROR: Missing ${key} in .env file`);
//         process.exit(1);
//     }
// }
console.log('Environment variables loaded successfully');

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'disabled');
const textModel = genAI.getGenerativeModel({ model: "gemini-pro" });

// Helper Functions
function generateUniqueSeed(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input + Date.now().toString() + Math.random().toString());
    return hash.digest('hex').substring(0, 10);
}

// AI Functions
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

// Main API Route
app.post('/api/generate', async (req, res) => {
    try {
        const { brandName, brandInfo, imageType } = req.body;
        if (!brandName || !brandInfo || !imageType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Step 1: Generate image prompt
        const imagePrompt = await AIService.generateImagePrompt(brandName, imageType, brandInfo);
        console.log('Generated image prompt:', imagePrompt);

        // Step 2: Generate image
        const imageUrl = await AIService.generateImage(imagePrompt);
        console.log('Generated image URL:', imageUrl);

        // Step 3: Generate brand description
        const descriptionPrompt = `Create a professional and engaging brand description for "${brandName}". 
        Use this context: ${brandInfo}
        Make it sound natural and compelling, highlighting key brand values and unique selling points.
        Keep it concise but impactful, around 2-3 sentences.`;

        const descriptionResult = await textModel.generateContent(descriptionPrompt);
        const brandDescription = descriptionResult.response.text().trim();
        console.log('Generated brand description:', brandDescription);

        // Step 4: Generate voice
        const audioData = await AIService.generateVoice(brandDescription);
        console.log('Generated audio data successfully');

        return res.json({
            success: true,
            imageUrl,
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

// Test route for ElevenLabs
app.get('/api/check-elevenlabs', async (req, res) => {
    try {
        const testText = "Hello! This is a test of the ElevenLabs voice synthesis.";
        const audioData = await AIService.generateVoice(testText);
        return res.json({ success: true, audioData });
    } catch (error) {
        console.error('ElevenLabs Test Error:', error);
        return res.status(500).json({
            error: 'ElevenLabs test failed',
            details: error.message
        });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server initialization complete. Ready to handle requests.');
});

// Helper function to generate unique seeds
function generateUniqueSeed(input) {
    const hash = crypto.createHash('sha256');
    hash.update(input + Date.now().toString() + Math.random().toString());
    return hash.digest('hex').substring(0, 10);
}

// Function to generate detailed image prompts
async function generateImagePromptWithGemini(brandName, type, context) {
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

// Function to generate image with DALL-E
async function generateImageWithDallE(prompt, size = "1024x1024") {
    console.log('Generating image with DALL-E 3:', prompt.substring(0, 100) + '...');
    
    try {
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            quality: "standard",
            style: "natural"
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.data[0].url;
    } catch (error) {
        console.error('DALL-E Error:', error.response?.data || error.message);
        throw new Error('Image generation failed');
    }
}

// Main route handler
app.post('/api/generate', async (req, res) => {
    try {
        const { brandName, brandInfo, imageType } = req.body;
        if (!brandName || !brandInfo || !imageType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        console.log('Received generation request for brand:', brandName);

        // Step 1: Generate detailed prompt with Gemini
        const imagePrompt = await generateImagePromptWithGemini(brandName, imageType, brandInfo);
        console.log('Generated image prompt:', imagePrompt);

        // Step 2: Generate image with DALL-E
        const imageUrl = await generateImageWithDallE(imagePrompt);
        console.log('Generated image URL:', imageUrl);

        // Step 3: Generate brand description with Gemini
        const descriptionPrompt = `Create a professional and engaging brand description for "${brandName}". 
        Use this context: ${brandInfo}
        Make it sound natural and compelling, highlighting key brand values and unique selling points.
        Keep it concise but impactful, around 2-3 sentences.`;

        const descriptionResult = await textModel.generateContent(descriptionPrompt);
        const brandDescription = descriptionResult.response.text().trim();
        console.log('Generated brand description:', brandDescription);

        // Step 4: Generate voice with ElevenLabs
        const audioData = await generateVoiceWithElevenLabs(brandDescription);
        console.log('Generated audio data successfully');

        // Return all generated content
        return res.json({
            success: true,
            imageUrl,
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

// Function to generate voice with ElevenLabs
async function generateVoiceWithElevenLabs(text, voiceId = 'ThT5KcBeYPX3keUQqHPh', modelId = 'eleven_monolingual_v1') {
    console.log('Generating voice with ElevenLabs:', text.substring(0, 100) + '...');
    
    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            {
                text: text,
                model_id: modelId,
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            },
            {
                headers: {
                    'Accept': 'audio/mpeg',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                responseType: 'arraybuffer'
            }
        );

        // Convert audio buffer to base64
        const audioBase64 = Buffer.from(response.data).toString('base64');
        return `data:audio/mpeg;base64,${audioBase64}`;
    } catch (error) {
        console.error('ElevenLabs Error:', error.response?.data || error.message);
        throw new Error('Voice generation failed');
    }
}

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('Server initialization complete. Ready to handle requests.');
});
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.data[0].url;
    } catch (error) {
        console.error('DALL-E Error:', error.response?.data || error.message);
        throw new Error('Image generation failed');
    }
}

// Function to generate image with DALL-E 3
async function generateImageWithDallE(prompt, size = "1024x1024") {
    try {
        console.log('Generating image with DALL-E 3:', prompt.substring(0, 100) + '...');
        
        const response = await axios.post('https://api.openai.com/v1/images/generations', {
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: size,
            quality: "standard",
            style: "natural"
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.data[0].url;
    } catch (error) {
        console.error('Error generating image with DALL-E:', error.response?.data || error.message);
        throw error;
    }
}

// AI-powered image generation using Gemini for concepts and DALL-E for generation
async function generateUniqueImagesWithGemini(brandName, userPrompt, brandStory) {
    try {
        console.log('Generating unique image concepts with Gemini AI...');
        
        // Create detailed prompts for different image types
        const imagePrompts = [
            {
                type: 'social',
                prompt: `Create a detailed visual prompt for an AI image generator to create a social media post image for "${brandName}".
                Context: ${userPrompt}
                Brand story: ${brandStory}
                
                Create a professional, detailed description that covers:
                1. Main subject and focal point
                2. Specific visual elements unique to this brand
                3. Color palette and lighting
                4. Composition and layout
                5. Mood and atmosphere
                6. Texture and materials
                7. Background elements
                
                Make it photorealistic and highly detailed. Format the response as a clear, comma-separated list of descriptive elements.`
            },
            {
                type: 'banner',
                prompt: `Create a detailed visual prompt for an AI image generator to create a website banner image for "${brandName}".
                Context: ${userPrompt}
                Brand story: ${brandStory}
                
                Create a professional, detailed description that covers:
                1. Wide format composition (16:9 ratio)
                2. Focal point and visual hierarchy
                3. Brand-specific visual elements
                4. Professional color scheme
                5. Lighting and atmosphere
                6. Texture and depth
                7. Space for text overlay
                
                Make it photorealistic and highly detailed. Format the response as a clear, comma-separated list of descriptive elements.`
            }
        ];

        const imageResults = [];
        
        for (const {type, prompt} of imagePrompts) {
            try {
                // Generate detailed image concept with Gemini
                const result = await textModel.generateContent(prompt);
                const imageDescription = await result.response.text();
                
                console.log(`Generated ${type} concept:`, imageDescription);

                // Generate actual image with DALL-E
                const finalPrompt = `Create a professional ${type === 'social' ? 'square social media post' : 'wide banner'} image for ${brandName}. ${imageDescription}. Make it photorealistic, highly detailed, and suitable for commercial use. Ensure it matches the brand's identity and story.`;
                
                const imageUrl = await generateImageWithDallE(finalPrompt);
                
                imageResults.push({
                    url: imageUrl,
                    concept: imageDescription,
                    type: type
                });
                
                console.log(`Generated ${type} image successfully`);
                
            } catch (error) {
                console.error(`Error generating image concept ${i + 1}:`, error);
                // Fallback with truly unique identifier
                const fallbackId = Date.now() + Math.random() * 100000 + i;
                imageResults.push({
                    url: `https://picsum.photos/seed/${Math.floor(fallbackId)}/800/600`,
                    concept: `Unique ${i === 0 ? 'social' : 'banner'} image for ${brandName}`,
                    type: i === 0 ? 'social' : 'banner'
                });
            }
        }
        
        console.log('Generated unique AI-powered images:', imageResults.map(img => img.concept));
        return imageResults.map(img => img.url);
        
    } catch (error) {
        console.error('Error in Gemini image generation:', error);
        // Ultimate fallback with guaranteed uniqueness
        const timestamp = Date.now();
        return [
            `https://picsum.photos/seed/${brandName.replace(/\s/g, '')}-${timestamp}/800/600`,
            `https://picsum.photos/seed/${brandName.replace(/\s/g, '')}-${timestamp + 1}/800/600`
        ];
    }
}

// Helper function to generate unique hash
function generateUniqueHash(text) {
    let hash = 0;
    const str = text + Date.now() + Math.random();
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
}

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Helper endpoint to check ElevenLabs API key
app.get('/api/check-elevenlabs', async (req, res) => {
    try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'Accept': 'application/json',
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            }
        });
        
        console.log('ElevenLabs API check successful');
        res.json({ 
            status: 'OK', 
            message: 'ElevenLabs API key is valid',
            voiceCount: response.data.voices?.length || 0
        });
    } catch (error) {
        console.error('ElevenLabs API check failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        res.status(error.response?.status || 500).json({ 
            status: 'Error',
            message: error.response?.data?.detail || error.message
        });
    }
});

// Main generation endpoint
app.post('/api/generate', async (req, res) => {
    console.log('Received request to /api/generate');
    
    try {
        // Step 0: Validate input
        const { userPrompt } = req.body;
        if (!userPrompt) {
            console.log('Missing userPrompt in request body');
            return res.status(400).json({ error: "userPrompt is required" });
        }
        console.log(`Processing request for: "${userPrompt}"`);

        // Step 1: Generate Brand Identity
        try {
            console.log('Step 1: Generating brand identity...');
            const identityModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            const identityPrompt = `Based on the product idea "${userPrompt}", create a detailed brand identity. 
            Respond with ONLY a valid JSON object with keys: "mascotDescription", "visualStyle", and "adSlogan". Example: 
            {"mascotDescription": "A cheerful fox with glasses", "visualStyle": "Modern and minimal", "adSlogan": "Smart choices, bright future"}`;
            
            console.log('Sending prompt to Gemini...');
            const identityResult = await identityModel.generateContent(identityPrompt);
            console.log('Received response from Gemini');
            
            const identityResponseText = await identityResult.response.text();
            console.log('Raw response:', identityResponseText);
            
            // Clean the response to ensure valid JSON
            let cleanedResponse = identityResponseText.trim();
            cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
            cleanedResponse = cleanedResponse.trim();
            
            console.log('Cleaned JSON response:', cleanedResponse);
            
            try {
                const brandIdentity = JSON.parse(cleanedResponse);
                console.log('Successfully parsed brand identity:', brandIdentity);
                
                // Step 2: Generate unique images using Gemini AI for creative prompts
                console.log('Step 2: Generating unique AI-powered images...');
                
                // Use Gemini to create unique image concepts
                const imageUrls = await generateUniqueImagesWithGemini(brandIdentity.brandName, userPrompt, brandIdentity.brandStory);
                
                // Step 3: Generate Voiceover with ElevenLabs
                try {
                    console.log('Step 3: Generating professional voiceover with ElevenLabs...');
                    
                    // First verify the API key and get available voices
                    const voicesResponse = await axios.get('https://api.elevenlabs.io/v1/voices', {
                        headers: {
                            'Accept': 'application/json',
                            'xi-api-key': process.env.ELEVENLABS_API_KEY
                        }
                    });

                    if (!voicesResponse.data || !voicesResponse.data.voices) {
                        throw new Error('No voices available from ElevenLabs API');
                    }

                    // Select the best voice based on the brand personality
                    const voiceCategories = {
                        professional: ['Rachel', 'Adam', 'Christina'],
                        friendly: ['Bella', 'Antoni', 'Josh'],
                        energetic: ['Sam', 'Ella', 'Thomas'],
                        warm: ['Grace', 'Daniel', 'Charlotte']
                    };

                    // Find the best matching voice based on brand identity
                    const availableVoices = voicesResponse.data.voices;
                    let selectedVoice = null;
                    let category = 'professional'; // Default category
                    
                    const personality = (brandIdentity.brandPersonality || '').toLowerCase();
                    if (personality.includes('friendly') || personality.includes('casual')) {
                        category = 'friendly';
                    } else if (personality.includes('energetic') || personality.includes('dynamic')) {
                        category = 'energetic';
                    } else if (personality.includes('warm') || personality.includes('welcoming')) {
                        category = 'warm';
                    }

                    // Try to find a voice from the preferred category
                    selectedVoice = availableVoices.find(voice => 
                        voiceCategories[category].includes(voice.name)
                    );

                    // Fallback to first available voice if no match found
                    if (!selectedVoice && availableVoices.length > 0) {
                        selectedVoice = availableVoices[0];
                    }

                    if (!selectedVoice) {
                        throw new Error('No suitable voice found in ElevenLabs');
                    }

                    console.log(`Selected voice: ${selectedVoice.name} (${selectedVoice.voice_id})`);
                    console.log('Text to synthesize:', brandIdentity.adSlogan);

                    // Generate the voiceover with optimal settings
                    const voiceResponse = await axios({
                        method: 'post',
                        url: `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice.voice_id}/stream`,
                        data: {
                            text: brandIdentity.adSlogan,
                            model_id: 'eleven_multilingual_v2',
                            voice_settings: {
                                stability: 0.75,
                                similarity_boost: 0.75,
                                style: 1.0,
                                use_speaker_boost: true
                            }
                        },
                        headers: {
                            'Accept': 'audio/mpeg',
                            'xi-api-key': process.env.ELEVENLABS_API_KEY,
                            'Content-Type': 'application/json'
                        },
                        responseType: 'arraybuffer'
                    });
                            }
                        },
                        {
                            headers: {
                                'Accept': 'audio/mpeg',
                                'Content-Type': 'application/json',
                                'xi-api-key': process.env.ELEVENLABS_API_KEY
                            },
                            responseType: 'arraybuffer'
                        }
                                    use_speaker_boost: true // Clearer audio
                                }
                            },
                            {
                                headers: {
                                    'Accept': 'audio/mpeg',
                                    'xi-api-key': process.env.ELEVENLABS_API_KEY,
                                    'Content-Type': 'application/json'
                                },
                                responseType: 'arraybuffer'
                            }
                        );
                        
                        console.log('Received audio data from ElevenLabs!');
                        const audioBase64 = Buffer.from(elevenlabsResponse.data).toString('base64');
                        
                        // Full response with audio and brand details
                        const responseData = {
                            imageUrls: imageUrls,
                            audioBase64: audioBase64,
                            adSlogan: brandIdentity.adSlogan,
                            mascotDescription: brandIdentity.mascotDescription,
                            visualStyle: brandIdentity.visualStyle,
                            useElevenLabs: true
                        };
                        
                        console.log('Sending complete response with ElevenLabs audio');
                        res.json(responseData);
                        console.log('Request processed successfully with ElevenLabs audio');
                        
                    } catch (elevenlabsError) {
                        // Retry ElevenLabs with a different voice if the first attempt fails
                        console.error('ElevenLabs API error:', elevenlabsError.message);
                        if (elevenlabsError.response) {
                            console.error('Status:', elevenlabsError.response.status);
                            console.error('Data:', elevenlabsError.response.data);
                            console.error('Headers:', JSON.stringify(elevenlabsError.response.headers));
                        } else if (elevenlabsError.request) {
                            console.error('Request was made but no response received:', elevenlabsError.request);
                        } else {
                            console.error('Error details:', elevenlabsError);
                        }
                        
                        console.log('Retrying with alternate ElevenLabs voice...');
                        try {
                            // Try with a different voice
                            const fallbackVoice = voices.rachel; // Use Rachel as fallback
                            console.log('Attempting with fallback voice:', fallbackVoice);
                            
                            const elevenlabsRetryResponse = await axios.post(
                                `https://api.elevenlabs.io/v1/text-to-speech/${fallbackVoice}`,
                                {
                                    text: brandIdentity.adSlogan,
                                    model_id: "eleven_monolingual_v1",
                                    voice_settings: { 
                                        stability: 0.7, // More stable settings for fallback
                                        similarity_boost: 0.7,
                                        style: 0.3,
                                        use_speaker_boost: true
                                    }
                                },
                                {
                                    headers: {
                                        'Accept': 'audio/mpeg',
                                        'xi-api-key': process.env.ELEVENLABS_API_KEY,
                                        'Content-Type': 'application/json'
                                    },
                                    responseType: 'arraybuffer'
                                }
                            );
                            
                            console.log('Received audio data from fallback ElevenLabs voice!');
                            const fallbackAudioBase64 = Buffer.from(elevenlabsRetryResponse.data).toString('base64');
                            
                            const fallbackResponseData = {
                                imageUrls: imageUrls,
                                audioBase64: fallbackAudioBase64,
                                adSlogan: brandIdentity.adSlogan,
                                mascotDescription: brandIdentity.mascotDescription,
                                visualStyle: brandIdentity.visualStyle,
                                useElevenLabs: true
                            };
                            
                            console.log('Sending complete response with fallback ElevenLabs voice');
                            res.json(fallbackResponseData);
                        } catch (retryError) {
                            // If all ElevenLabs attempts fail, return an error but include other assets
                            console.error('All ElevenLabs attempts failed:', retryError.message);
                            if (retryError.response) {
                                console.error('Retry status:', retryError.response.status);
                                console.error('Retry data:', retryError.response.data);
                                console.error('Retry headers:', JSON.stringify(retryError.response.headers));
                            } else if (retryError.request) {
                                console.error('Retry request was made but no response received:', retryError.request);
                            } else {
                                console.error('Retry error details:', retryError);
                            }
                            
                            // Check if it's an authorization error
                            let errorMessage = "ElevenLabs API error. Please try again.";
                            if (retryError.response && retryError.response.status === 401) {
                                errorMessage = "ElevenLabs API authentication failed. Please check your API key.";
                            } else if (retryError.response && retryError.response.status === 429) {
                                errorMessage = "ElevenLabs API rate limit exceeded. Please try again later.";
                            }
                            
                            // Return successful response without audio, but with all other assets
                            const fallbackResponseData = {
                                imageUrls: imageUrls,
                                audioBase64: null, // Null indicates ElevenLabs failed but other assets are available
                                adSlogan: brandIdentity.adSlogan,
                                mascotDescription: brandIdentity.mascotDescription,
                                visualStyle: brandIdentity.visualStyle,
                                elevenlabsError: errorMessage
                            };
                            
                            // Still return 200 OK to show other assets
                            console.log('Sending response with other assets but no audio due to ElevenLabs API failure');
                            res.status(200).json(fallbackResponseData);
                        }
                    }
                    
                } catch (audioError) {
                    console.error('Error in ElevenLabs API call:', audioError);
                    if (audioError.response) {
                        console.error('ElevenLabs response status:', audioError.response.status);
                        console.error('ElevenLabs response data:', audioError.response.data);
                    }
                    res.status(500).json({ error: "Failed to generate voiceover. Please try again." });
                }
            } catch (jsonError) {
                console.error('Error parsing JSON response:', jsonError);
                console.error('Invalid JSON:', cleanedResponse);
                res.status(500).json({ error: "Failed to parse AI response. Please try again." });
            }
        } catch (geminiError) {
            console.error('Error in Gemini API call:', geminiError);
            res.status(500).json({ error: "Failed to generate brand identity. Please try again." });
        }
    } catch (error) {
        console.error("General error in /api/generate:", error);
        res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
});

// New endpoint for visual brand concept generation
app.post('/api/generate-visual-concept', async (req, res) => {
    console.log('Received request to /api/generate-visual-concept');
    
    try {
        // Validate input
        const { brandIdentity, referenceImageUrl } = req.body;
        if (!brandIdentity || !referenceImageUrl) {
            console.log('Missing required parameters');
            return res.status(400).json({ error: "brandIdentity and referenceImageUrl are required" });
        }
        
        console.log(`Processing visual concept request with reference image: "${referenceImageUrl}"`);
        
        try {
            // Use Gemini 1.5 Pro for multimodal capabilities
            const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            
            // Prepare the prompt with image
            const imageData = await fetch(referenceImageUrl).then(r => r.arrayBuffer());
            const imageBase64 = Buffer.from(imageData).toString('base64');
            const mimeType = referenceImageUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
            
            const imageParts = [
                {
                    inlineData: {
                        data: imageBase64,
                        mimeType: mimeType
                    }
                }
            ];
            
            // Create text prompt that includes the brand identity
            const textPrompt = `Based on this reference image and the following brand identity:
            - Mascot: ${brandIdentity.mascotDescription}
            - Visual Style: ${brandIdentity.visualStyle}
            - Slogan: ${brandIdentity.adSlogan}
            
            Please provide a detailed description of how to adapt this image to match the brand identity.
            Also include a color palette (with hex codes) that would work well with this brand.
            Respond in JSON format with keys: "conceptDescription", "colorPalette", "designElements", and "visualInspiration".`;
            
            // Generate content with image and text
            console.log('Sending multimodal prompt to Gemini...');
            const result = await visionModel.generateContent([textPrompt, ...imageParts]);
            const responseText = await result.response.text();
            
            // Clean the response to ensure valid JSON
            let cleanedResponse = responseText.trim();
            cleanedResponse = cleanedResponse.replace(/```json\s*|\s*```/g, '');
            cleanedResponse = cleanedResponse.trim();
            
            try {
                const visualConcept = JSON.parse(cleanedResponse);
                console.log('Successfully generated visual concept');
                
                res.json({
                    visualConcept: visualConcept,
                    referenceImageUrl: referenceImageUrl
                });
                
            } catch (jsonError) {
                console.error('Error parsing visual concept JSON:', jsonError);
                res.status(500).json({ error: "Failed to parse visual concept response." });
            }
            
        } catch (geminiError) {
            console.error('Error in Gemini visual concept generation:', geminiError);
            res.status(500).json({ error: "Failed to generate visual concept. Please try again." });
        }
    } catch (error) {
        console.error("General error in /api/generate-visual-concept:", error);
        res.status(500).json({ error: "An unexpected error occurred. Please try again." });
    }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
});