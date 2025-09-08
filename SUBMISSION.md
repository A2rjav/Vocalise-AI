# Vocalise-AI Submission

## Links
- GitHub Repository: https://github.com/A2rjav/Vocalise-AI
- [Video Demo Link] (TODO: Add your video demo link once uploaded)

## Gemini Integration Writeup (200 words)
Vocalise-AI leverages Gemini 2.5 Flash Image features to create an innovative voice branding solution. The application utilizes Gemini's advanced natural language understanding to:

1. Brand Description Generation: Using Gemini's context-aware text generation, we create compelling, natural-sounding brand descriptions from user inputs. The model understands brand context and generates appropriate tone and style.

2. Voice Prompt Optimization: We use Gemini to optimize voice generation prompts, ensuring the synthesized speech matches the brand's personality and marketing goals. The model analyzes brand attributes to determine ideal voice parameters.

3. Content Adaptation: Gemini helps adapt written content for vocal delivery, making necessary adjustments for natural speech patterns while maintaining brand consistency.

## Setup Instructions
1. Clone the repository:
```bash
git clone https://github.com/A2rjav/Vocalise-AI.git
cd Vocalise-AI
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
Create a .env file in the backend directory with:
```
ELEVENLABS_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
```

5. Start the servers:
Backend:
```bash
cd backend
node server3.js
```

Frontend:
```bash
cd frontend
npm run dev
```

Access the application at http://localhost:5173
