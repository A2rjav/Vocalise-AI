// frontend/src/App.jsx - This is the blueprint for your UI.

import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import axios from 'axios';
import './App.css'; 
import './animations.css'; // Import animations
import './tooltip.css'; // Import tooltips
import './concept.css'; // Import visual concept styles

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipContent, setTooltipContent] = useState('');
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationType, setNotificationType] = useState('success');
    
    // Visual concept generation states
    const [visualReferenceImages] = useState([
        "https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1080&h=1080&fit=crop", // Product on display
        "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=1080&h=1080&fit=crop", // Workspace
        "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1080&h=1080&fit=crop", // Person with product
        "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=1080&h=1080&fit=crop"  // Abstract design
    ]);
    const [selectedReferenceImage, setSelectedReferenceImage] = useState(null);
    const [visualConcept, setVisualConcept] = useState(null);
    const [isGeneratingConcept, setIsGeneratingConcept] = useState(false);
    const [visualConceptError, setVisualConceptError] = useState(null);
    
    const generationSteps = [
        "Analyzing your request",
        "Creating brand identity",
        "Generating marketing assets", 
        "Crafting audio content",
        "Finalizing results"
    ];

    const tooltipRef = useRef(null);
    const helpButtonRef = useRef(null);

    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // Reset transcript when component mounts
    useEffect(() => {
        resetTranscript();
        
        // Add event listener for manual transcript edits
        const handleManualEdit = (event) => {
            if (event.target && event.target.value !== undefined) {
                SpeechRecognition.abortListening();
                resetTranscript();
                setTimeout(() => {
                    const transcriptVal = event.target.value;
                    const manualTranscriptEvent = new CustomEvent('speech', { 
                        detail: { results: [[{ transcript: transcriptVal }]], isFinal: true } 
                    });
                    document.dispatchEvent(manualTranscriptEvent);
                }, 100);
            }
        };
        
        window.addEventListener('manualTranscriptEdit', handleManualEdit);
        
        return () => {
            window.removeEventListener('manualTranscriptEdit', handleManualEdit);
        };
    }, [resetTranscript]);

    useEffect(() => {
        // Check for user preference in localStorage
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true') {
            setDarkMode(true);
            document.body.setAttribute('data-theme', 'dark');
        }

        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        // Check if this is the first visit
        const firstVisit = localStorage.getItem('firstVisit') !== 'false';
        if (firstVisit) {
            // Show welcome tooltip after a short delay
            setTimeout(() => {
                const micButton = document.querySelector('.mic-button');
                if (micButton) {
                    showTooltipForElement(
                        micButton, 
                        'Click here to start recording. Your voice will be recorded until you click stop.', 
                        'bottom'
                    );
                }
            }, 2000);
            
            localStorage.setItem('firstVisit', 'false');
        }

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    const toggleTheme = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
        document.body.setAttribute('data-theme', newMode ? 'dark' : 'light');
        
        // Show notification
        showSuccessNotification(newMode ? 'Dark mode enabled' : 'Light mode enabled');
    };
    
    // Function to show tooltip for a specific element
    const showTooltipForElement = (element, content, position = 'top') => {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        let top, left;
        
        // Calculate position based on the specified direction
        switch(position) {
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + rect.width / 2;
                break;
            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - 10;
                break;
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + 10;
                break;
            case 'top':
            default:
                top = rect.top - 10;
                left = rect.left + rect.width / 2;
                break;
        }
        
        setTooltipPosition({ top, left });
        setTooltipContent(content);
        setShowTooltip(true);
        
        // Auto-hide the tooltip after 5 seconds
        setTimeout(() => {
            setShowTooltip(false);
        }, 5000);
    };
    
    // Function to show notification messages
    const showSuccessNotification = (message, type = 'success') => {
        setNotificationMessage(message);
        setNotificationType(type);
        setShowNotification(true);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            setShowNotification(false);
        }, 4000);
    };

    // Function to handle progress simulation
    const simulateProgress = () => {
        setProgress(0);
        setCurrentStep(0);
        
        // Simulate progress with realistic timing
        let step = 0;
        const totalSteps = generationSteps.length;
        const interval = setInterval(() => {
            if (step < totalSteps) {
                setCurrentStep(step);
                setProgress((step / totalSteps) * 100);
                step++;
            } else {
                clearInterval(interval);
            }
        }, 1500); // Each step takes 1.5 seconds
        
        return interval;
    };
    
    // Function to start a guided tour
    const startGuidedTour = () => {
        // First step - highlight the microphone
        const micButton = document.querySelector('.mic-button');
        if (micButton) {
            showTooltipForElement(
                micButton, 
                'Step 1: Click here to start recording your voice prompt. Will record until you click stop.', 
                'bottom'
            );
        }
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="App">
                <header className="App-header">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        <img 
                            src={darkMode ? "/light-mode-icon.svg" : "/dark-mode-icon.svg"} 
                            alt={darkMode ? "Switch to light mode" : "Switch to dark mode"} 
                        />
                    </button>
                    <div className="logo-container">
                        <img src="/logo.svg" alt="Vocalize AI Logo" className="logo" />
                        <h1>Vocalize AI</h1>
                    </div>
                    <p>Your browser doesn't support speech recognition. Please try using Chrome, Edge, or Safari.</p>
                </header>
            </div>
        );
    }

    const handleGenerate = async () => {
        if (!transcript) {
            alert("Please record a prompt first!");
            return;
        }
        setIsLoading(true);
        setError(null);
        setResults(null);
        
        // Start progress simulation
        const progressInterval = simulateProgress();
        
        try {
            const response = await axios.post('http://localhost:3001/api/generate', {
                userPrompt: transcript
            });
            setResults(response.data);
            // Complete progress to 100%
            setProgress(100);
            setCurrentStep(generationSteps.length - 1);
            
            // Show success notification
            showSuccessNotification('Marketing assets generated successfully!');
            
            // Scroll to results
            setTimeout(() => {
                const resultsElement = document.querySelector('.results-container');
                if (resultsElement) {
                    resultsElement.scrollIntoView({ behavior: 'smooth' });
                    
                    // Show download tooltip after a short delay
                    setTimeout(() => {
                        const downloadButton = document.querySelector('.download-button');
                        if (downloadButton) {
                            showTooltipForElement(
                                downloadButton, 
                                'Click here to download your marketing assets', 
                                'left'
                            );
                        }
                    }, 2000);
                }
            }, 100);
        } catch (err) {
            // Clear progress animation
            setProgress(0);
            setCurrentStep(0);
            
            // Provide more specific error messaging
            if (err.code === 'ECONNREFUSED' || err.message.includes('Network Error')) {
                setError("Cannot connect to backend server. Please make sure the backend is running.");
                showSuccessNotification('Error: Backend server connection failed', 'error');
            } else if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(`Server error: ${err.response.data?.error || err.response.statusText}`);
                showSuccessNotification(`Error: ${err.response.status} ${err.response.statusText}`, 'error');
            } else if (err.request) {
                // The request was made but no response was received
                setError("No response from server. Check your network connection.");
                showSuccessNotification('Error: No response from server', 'error');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError(`An unexpected error occurred: ${err.message}`);
                showSuccessNotification('Error: Something went wrong', 'error');
            }
            console.error('Generation error details:', err);
        } finally {
            clearInterval(progressInterval);
            setIsLoading(false);
        }
    };
    
    // Function to handle generating visual concepts
    const handleGenerateVisualConcept = async () => {
        if (!selectedReferenceImage || !results) {
            return;
        }
        
        setIsGeneratingConcept(true);
        setVisualConceptError(null);
        
        try {
            const response = await axios.post('http://localhost:3001/api/generate-visual-concept', {
                brandIdentity: {
                    mascotDescription: results.mascotDescription,
                    visualStyle: results.visualStyle,
                    adSlogan: results.adSlogan
                },
                referenceImageUrl: selectedReferenceImage
            });
            
            setVisualConcept(response.data);
            showSuccessNotification('Visual concept generated successfully!');
            
        } catch (err) {
            console.error('Error generating visual concept:', err);
            setVisualConceptError(err.response?.data?.error || 'Failed to generate visual concept');
            showSuccessNotification('Error generating visual concept', 'error');
        } finally {
            setIsGeneratingConcept(false);
        }
    };

    const downloadAssets = () => {
        // Create a text file with all the marketing content
        const content = `
        # Marketing Assets Generated by Vocalize AI
        
        ## Brand Identity
        Mascot: ${results.mascotDescription}
        Visual Style: ${results.visualStyle}
        Slogan: ${results.adSlogan}
        
        ## Image URLs
        ${results.imageUrls.join('\n')}
        
        Generated on: ${new Date().toLocaleString()}
        `;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'vocalize-ai-marketing-assets.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Show success notification
        showSuccessNotification('Marketing assets downloaded successfully!');
    };

    return (
        <div className="App">
            <header className="App-header">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    <img 
                        src={darkMode ? "/light-mode-icon.svg" : "/dark-mode-icon.svg"} 
                        alt={darkMode ? "Switch to light mode" : "Switch to dark mode"} 
                    />
                </button>
                <div className="logo-container">
                    <img src="/logo.svg" alt="Vocalize AI Logo" className="logo" />
                    <h1>Vocalize AI</h1>
                </div>
                <p>Transform your voice into compelling marketing assets with AI-powered generation</p>
            </header>
            
            <main>
                <section className="recording-section">
                    <div className="status-indicator">
                        <div className={`status-dot ${listening ? 'active' : ''}`}></div>
                        <span className="status-text">{listening ? 'Recording...' : 'Ready to record'}</span>
                    </div>
                    
                    {listening && (
                        <div className={`recording-waves recording-active`}>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                            <div className="wave-bar"></div>
                        </div>
                    )}
                    
                    <div className="controls">
                        <button 
                            className="mic-button" 
                            onClick={() => {
                                // Start listening with continuous mode enabled
                                SpeechRecognition.startListening({ 
                                    continuous: true,  // Keep listening until explicitly stopped
                                    interimResults: true // Get results as you speak
                                });
                                // Show stop button tooltip
                                setTimeout(() => {
                                    const stopButton = document.querySelector('.stop-button');
                                    if (stopButton) {
                                        showTooltipForElement(
                                            stopButton, 
                                            'Click here when you\'re done recording', 
                                            'bottom'
                                        );
                                    }
                                }, 1000);
                            }}
                            disabled={listening}
                        >
                            <img src="/mic-icon.svg" alt="Microphone" width="24" height="24" />
                            Start Recording
                        </button>
                        <button 
                            className="stop-button" 
                            onClick={() => {
                                SpeechRecognition.stopListening();
                                showSuccessNotification("Recording complete! Click 'Generate' to continue");
                                // Show generate button tooltip
                                setTimeout(() => {
                                    const generateButton = document.querySelector('.generate-button');
                                    if (generateButton) {
                                        showTooltipForElement(
                                            generateButton, 
                                            'Click here to generate marketing assets from your prompt', 
                                            'top'
                                        );
                                    }
                                }, 1000);
                            }}
                            disabled={!listening}
                        >
                            <img src="/stop-icon.svg" alt="Stop" width="24" height="24" />
                            Stop
                        </button>
                        <button 
                            className="reset-button" 
                            onClick={resetTranscript}
                            disabled={!transcript}
                        >
                            🔄 Reset
                        </button>
                    </div>
                    
                    {listening && (
                        <div className="recording-indicator">
                            🔴 Recording in progress... Speak clearly and continue until you're finished.
                        </div>
                    )}
                    
                    <textarea 
                        className="transcript-box" 
                        value={transcript} 
                        onChange={(e) => {
                            // Create a custom event to update the transcript state
                            const event = new Event('manualTranscriptEdit', { bubbles: true });
                            event.target = { value: e.target.value };
                            window.dispatchEvent(event);
                        }}
                        placeholder="Describe your product with your voice. For example: 'Create marketing assets for an organic pet food brand that uses only natural ingredients...'" 
                    />
                    
                    <div className="editing-hint">
                        ✏️ You can edit the text above before generating assets
                    </div>

                    <button 
                        className="generate-button" 
                        onClick={handleGenerate} 
                        disabled={isLoading || !transcript}
                    >
                        {isLoading ? (
                            <>
                                <span className="loader"></span>
                                Generating Assets...
                            </>
                        ) : (
                            <>
                                ✨ Generate Marketing Assets
                            </>
                        )}
                    </button>
                </section>

                {isLoading && (
                    <div className="loading-container">
                        <img src="/loading-animation.svg" alt="Loading" className="loading-animation" />
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            {generationSteps.map((step, index) => (
                                <div key={index} className="progress-step">
                                    <div className={`progress-status ${index < currentStep ? 'done' : (index === currentStep ? 'active' : '')}`}>
                                        {index < currentStep ? '✓' : (index === currentStep ? '•' : '')}
                                    </div>
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                        <p className="loading-text">Creating your marketing assets with AI...</p>
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                {results && (
                    <div className="results-container">
                        <div className="results-header">
                            <h2>Your Marketing Assets</h2>
                            <button className="download-button" onClick={downloadAssets}>
                                <img src="/download-icon.svg" alt="Download" width="20" height="20" />
                                Download Assets
                            </button>
                        </div>
                        <div className="results-content">
                            {/* Brand Identity Details */}
                            <h3>Brand Identity</h3>
                            <div className="brand-identity">
                                <p><strong>Mascot:</strong> {results.mascotDescription}</p>
                                <p><strong>Visual Style:</strong> {results.visualStyle}</p>
                                <p><strong>Slogan:</strong> {results.adSlogan}</p>
                            </div>
                            
                            {/* Marketing Images */}
                            <h3>Marketing Images</h3>
                            <div className="image-gallery">
                                {results.imageUrls.map((url, index) => (
                                    <div key={index} className="image-container">
                                        <img src={url} alt={`Generated ad ${index + 1}`} />
                                        <p className="image-caption">
                                            {index === 0 ? 'Instagram Post' : 'Website Banner'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Audio Ad Section */}
                            <h3>Audio Advertisement</h3>
                            <div className="audio-section">
                                <p className="slogan-text">{results.adSlogan}</p>
                                
                                {/* ElevenLabs audio player */}
                                {results.audioBase64 ? (
                                    <div className="premium-audio">
                                        <p className="audio-quality-badge">✨ Premium Voice Quality</p>
                                        <audio 
                                            controls 
                                            src={`data:audio/mpeg;base64,${results.audioBase64}`}
                                            className="premium-audio-player"
                                        />
                                    </div>
                                ) : (
                                    <div className="audio-error-message">
                                        <p>
                                            <strong>Premium audio generation unavailable</strong><br />
                                            {results.elevenlabsError || "ElevenLabs API error. Please check your API key and account limits."}
                                        </p>
                                        <button 
                                            className="retry-button"
                                            onClick={() => {
                                                showSuccessNotification('Retrying audio generation...', 'info');
                                                setTimeout(() => {
                                                    const el = document.createElement('a');
                                                    el.href = "https://elevenlabs.io/subscription";
                                                    el.target = "_blank";
                                                    el.click();
                                                    showSuccessNotification('You can get a free API key at ElevenLabs.io', 'info');
                                                }, 500);
                                            }}
                                        >
                                            Get Free ElevenLabs API Key
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            {/* Visual Concept Generator */}
                            <h3 className="visual-concept-title">Visual Concept Generator</h3>
                            <div className="visual-concept-section">
                                <p className="visual-concept-intro">
                                    Transform existing imagery to match your brand identity using Gemini 1.5 Pro's multimodal capabilities.
                                </p>
                                <div className="reference-image-selector">
                                    <h4>Choose a reference image to transform:</h4>
                                    <div className="reference-images">
                                        {visualReferenceImages.map((image, index) => (
                                            <div 
                                                key={index} 
                                                className={`reference-image ${selectedReferenceImage === image ? 'selected' : ''}`}
                                                onClick={() => setSelectedReferenceImage(image)}
                                            >
                                                <img src={image} alt={`Reference ${index + 1}`} />
                                            </div>
                                        ))}
                                    </div>
                                    <button 
                                        className="generate-concept-button"
                                        onClick={handleGenerateVisualConcept}
                                        disabled={!selectedReferenceImage || isGeneratingConcept}
                                    >
                                        {isGeneratingConcept ? 'Generating...' : 'Generate Visual Concept'}
                                    </button>
                                </div>
                                
                                {visualConceptError && (
                                    <div className="error-message">
                                        ⚠️ {visualConceptError}
                                    </div>
                                )}
                                
                                {visualConcept && (
                                    <div className="visual-concept-results">
                                        <div className="concept-row">
                                            <div className="reference-side">
                                                <h4>Reference Image</h4>
                                                <img src={visualConcept.referenceImageUrl} alt="Reference" className="concept-image" />
                                            </div>
                                            <div className="concept-description-side">
                                                <h4>Brand Adaptation</h4>
                                                <p className="concept-description">{visualConcept.visualConcept.conceptDescription}</p>
                                                
                                                <h4>Color Palette</h4>
                                                <div className="color-palette">
                                                    {visualConcept.visualConcept.colorPalette.map((color, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            className="color-swatch" 
                                                            style={{backgroundColor: color}}
                                                            title={color}
                                                        ></div>
                                                    ))}
                                                </div>
                                                
                                                <h4>Design Elements</h4>
                                                <p>{visualConcept.visualConcept.designElements}</p>
                                                
                                                <h4>Visual Inspiration</h4>
                                                <p>{visualConcept.visualConcept.visualInspiration}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            {/* Tooltip Component */}
            <div 
                ref={tooltipRef}
                className={`tooltip ${showTooltip ? 'visible' : ''}`} 
                style={{ 
                    top: `${tooltipPosition.top}px`, 
                    left: `${tooltipPosition.left}px`,
                    transform: 'translate(-50%, -100%)' 
                }}
            >
                {tooltipContent}
            </div>
            
            {/* Notification System */}
            <div className={`success-notification ${showNotification ? 'visible' : ''}`} data-type={notificationType}>
                <span className="success-notification-icon">
                    {notificationType === 'error' ? '❌' : 
                     notificationType === 'warning' ? '⚠️' : 
                     notificationType === 'info' ? 'ℹ️' : '✓'}
                </span>
                <span className="success-notification-message">{notificationMessage}</span>
            </div>
            
            {/* Help Button */}
            <div 
                ref={helpButtonRef}
                className="help-button" 
                onClick={startGuidedTour}
                onMouseEnter={() => {
                    showTooltipForElement(
                        helpButtonRef.current, 
                        'Click for guided tour', 
                        'top'
                    );
                }}
                onMouseLeave={() => setShowTooltip(false)}
            >
                ?
            </div>
            
            <footer className="footer">
                <p>© {new Date().getFullYear()} Vocalize AI - Powered by Gemini AI & ElevenLabs</p>
            </footer>
        </div>
    );
}

export default App;
