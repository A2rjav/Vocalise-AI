# Vocalize AI - Voice-to-Marketing Assets Generator

## Overview
Vocalize AI transforms your voice input into complete marketing assets using Google's Gemini AI and ElevenLabs voice synthesis. Simply speak your product idea, and the application will generate a comprehensive brand identity, marketing images, and premium audio content.

## Key Features

### 1. Voice-to-Marketing Transformation
- **Continuous Voice Recording:** Speak naturally without time constraints
- **Real-time Transcription:** See your words as you speak
- **Progress Visualization:** Watch as AI processes your request in real-time

### 2. AI-Generated Marketing Assets
- **Brand Identity Creation:** Mascot description, visual style, and catchy slogan
- **Marketing Images:** Themed visuals for social media and web
- **Audio Advertisement:** Premium voice synthesis (ElevenLabs) or browser TTS fallback

### 3. Visual Concept Generation
- **Reference Image Transformation:** Select from curated images to adapt for your brand
- **Multimodal AI Processing:** Utilizes Gemini 1.5 Pro to understand visual content
- **Brand-Aligned Design Guidance:** Color palette, design elements, and visual inspiration

### 4. Enhanced User Experience
- **Dark/Light Mode:** Adaptive theming for any environment
- **Interactive Tooltips:** Guided tour for new users
- **Notification System:** Real-time feedback on actions
- **Responsive Design:** Works on any device size

## Technology Stack
- **Frontend:** React 19.1.1 with Vite
- **Backend:** Node.js with Express
- **AI Services:**
  - Google Generative AI (Gemini 1.5 Flash/Pro)
  - ElevenLabs Voice Synthesis
- **Speech Recognition:** Browser-native speech API with continuous recording

## How Vocalize AI Meets Judging Criteria

### 1. Functionality & Usefulness
- Solves a real business need by automating marketing asset creation
- Complete end-to-end solution from concept to assets
- Outputs practical, ready-to-use deliverables

### 2. Innovation & Wow Factor
- **Multimodal Processing:** Combines voice, text, and image processing
- **Visual Concept Generation:** Transforms reference images to match brand identity
- **Continuous Voice Recording:** Natural interaction without time limitations

### 3. Technical Execution
- **Advanced AI Integration:** Leverages Gemini's latest capabilities
- **Premium Voice Synthesis:** ElevenLabs integration for broadcast-quality audio
- **Responsive Error Handling:** Graceful handling of network/API failures

### 4. User Experience
- **Intuitive Interface:** Clear workflow from input to output
- **Real-time Feedback:** Visual indicators for processing status
- **Accessibility Features:** Dark mode, clear visual hierarchy
- **Guided Tours:** Interactive tooltips for new users

### 5. Creativity & Originality
- Novel approach to marketing asset generation
- Unique combination of voice input and multimodal output
- Creative visual concept transformation feature

### 6. Documentation & Code Quality
- Clean, well-structured React components
- Comprehensive error handling
- Detailed comments and documentation

## Getting Started

### Prerequisites
- Node.js 18+
- API keys for:
  - Google Generative AI
  - ElevenLabs (optional for premium voice)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```
4. Create a `.env` file in the backend directory:
   ```
   GOOGLE_API_KEY=your_gemini_api_key
   ELEVENLABS_API_KEY=your_elevenlabs_api_key
   ```

### Running the Application

1. Start the backend:
   ```
   cd backend
   npm start
   ```
2. Start the frontend:
   ```
   cd frontend
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`

## Usage Example

1. Click the "Start Recording" button
2. Speak your product description (e.g., "Create marketing assets for an organic pet food brand that uses only natural ingredients...")
3. Click "Stop" when finished
4. Click "Generate Marketing Assets"
5. Explore your generated brand identity, images, and audio content
6. Try the Visual Concept Generator to transform reference images to match your brand
7. Download your complete marketing package

## Future Enhancements
- Advanced image customization options
- Multiple voice options for audio ads
- Marketing copy generation for different platforms
- Animation and video generation
- Social media posting integration

---

Developed with ❤️ by Team Nano-Banana
