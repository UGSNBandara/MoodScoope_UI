import React, { useState, useRef, useEffect } from 'react';
import './MiddleSection.css';
import videoListening from "../assets/animatedVideo/listning_1.mp4";
import videoTalking from "../assets/animatedVideo/talking_1.mp4";
import videoThinking from "../assets/animatedVideo/thinking_1.mp4";
import poster from "../assets/image.png";

const VIDEO_THINKING = 0;
const VIDEO_LISTENING = 1;
const VIDEO_TALKING = 2;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const base64toBlob = (base64, contentType = '', sliceSize = 512) => {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: contentType });
};

const AgentDisplay = ({ videoIndex }) => {
    const videoSources = [videoThinking, videoListening, videoTalking];
    const currentVideoRef = useRef(null);
    const nextVideoRef = useRef(null);
    const [activeVideoIndex, setActiveVideoIndex] = useState(videoIndex);
    const [videoOpacities, setVideoOpacities] = useState({
        current: 1,
        next: 0
    });

    const primaryVideoSource = videoSources[activeVideoIndex];
    const secondaryVideoSource = videoSources[videoIndex];

    useEffect(() => {
        if (videoIndex !== activeVideoIndex) {
            const nextVideoElement = nextVideoRef.current;
            const currentVideoElement = currentVideoRef.current;

            if (nextVideoElement && secondaryVideoSource) {
                nextVideoElement.src = secondaryVideoSource;
                nextVideoElement.load();
                nextVideoElement.playbackRate = 1.0;
                nextVideoElement.currentTime = 0;
            }

            const fadeDuration = 200;

            const handleCanPlayThrough = () => {
                if (videoIndex !== activeVideoIndex) {
                    if (nextVideoElement) {
                        nextVideoElement.play().catch(error =>
                            console.error("Error playing next video:", error)
                        );
                    }
                    setVideoOpacities({ current: 0, next: 1 });
                    const timeoutId = setTimeout(() => {
                        setActiveVideoIndex(videoIndex);
                        setVideoOpacities({ current: 1, next: 0 });
                        if (currentVideoElement && currentVideoElement.src !== videoSources[videoIndex]) {
                            currentVideoElement.src = '';
                        }
                    }, fadeDuration);
                    return () => clearTimeout(timeoutId);
                }
            };

            if (nextVideoElement) {
                nextVideoElement.addEventListener('canplaythrough', handleCanPlayThrough);
            }

            return () => {
                if (nextVideoElement) {
                    nextVideoElement.removeEventListener('canplaythrough', handleCanPlayThrough);
                }
            };
        }
    }, [videoIndex, activeVideoIndex, videoSources]);

    useEffect(() => {
        const activeVideoElement = currentVideoRef.current;
        if (activeVideoElement) {
            activeVideoElement.loop = true;
            activeVideoElement.muted = true;
            activeVideoElement.playsInline = true;
            activeVideoElement.play().catch(error => console.error("Error playing active video:", error));
        }
    }, [activeVideoIndex]);

    return (
        <div className="agent-display">
            <video
                ref={currentVideoRef}
                src={primaryVideoSource}
                className="agent-img active-video"
                style={{ opacity: videoOpacities.current, filter: 'brightness(1.1) contrast(1.05)' }}
                key={`primary-video-${primaryVideoSource}`}
            />
            {videoIndex !== activeVideoIndex && secondaryVideoSource && (
                <video
                    ref={nextVideoRef}
                    poster={poster}
                    src={secondaryVideoSource}
                    className="agent-img next-video"
                    style={{
                        opacity: videoOpacities.next,
                        filter: 'brightness(1.2) contrast(1.05)'
                    }}
                    muted
                    playsInline
                    loop
                    preload="auto"
                    key={`secondary-video-${secondaryVideoSource}`}
                />
            )}
        </div>
    );
};

const OrderDetails = () => (
    <div className="order-details">
        <h3>Order Details</h3>
        <div className="order-placeholder">No items yet.</div>
    </div>
);

const ChatInterface = ({ setVideoIndex, videoIndex }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello wellcome You can talk with me using message box and voice", sender: 'agent' },
        { id: 3, text: "Press the voice recording icon to send voice, Thank you", sender: 'agent' },
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [agentAudioBlobUrl, setAgentAudioBlobUrl] = useState(null);
    const audioRef = useRef(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (videoIndex === VIDEO_LISTENING && inputMessage === '') {
            typingTimeoutRef.current = setTimeout(() => {
                setVideoIndex(VIDEO_THINKING);
            }, 3000);
        }
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, [inputMessage, videoIndex, setVideoIndex]);

    useEffect(() => {
        const audioEl = audioRef.current;
        if (agentAudioBlobUrl && audioEl) {
            setVideoIndex(VIDEO_TALKING);
            audioEl.src = agentAudioBlobUrl;
            audioEl.play().catch(e => console.error("Audio playback error:", e));

            const handleEnded = () => {
                setVideoIndex(VIDEO_LISTENING);
                window.URL.revokeObjectURL(agentAudioBlobUrl);
                setAgentAudioBlobUrl(null);
            };

            audioEl.addEventListener('ended', handleEnded);

            return () => {
                audioEl.removeEventListener('ended', handleEnded);
                if (agentAudioBlobUrl) {
                    window.URL.revokeObjectURL(agentAudioBlobUrl);
                }
            };
        }
    }, [agentAudioBlobUrl, setVideoIndex]);

    const handleSendMessage = async () => {
        if (inputMessage.trim()) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            setVideoIndex(VIDEO_THINKING);

            const userMessage = {
                id: messages.length + 1,
                text: inputMessage,
                sender: 'user',
            };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInputMessage('');

            try {
                const formData = new FormData();
                formData.append("text", inputMessage);

                const response = await fetch("http://127.0.0.1:8000/tts/", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.text && data.audio_base64) {
                    setMessages((prev) => [...prev, { id: prev.length + 1, text: data.text, sender: 'agent' }]);
                    await delay(500);
                    const audioBlob = base64toBlob(data.audio_base64, 'audio/mpeg');
                    const url = window.URL.createObjectURL(audioBlob);
                    setAgentAudioBlobUrl(url);
                } else {
                    throw new Error("Invalid response format from TTS API: missing text or audio_base64");
                }
            } catch (error) {
                console.error("Error sending message or fetching audio:", error);
                setMessages((prev) => [
                    ...prev,
                    { id: prev.length + 1, text: "Sorry, there was an error processing your request. Please try again.", sender: 'agent' }
                ]);
                setVideoIndex(VIDEO_LISTENING);
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const startListeningOnTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        if (videoIndex !== VIDEO_TALKING) {
            setVideoIndex(VIDEO_LISTENING);
        }
    };

    return (
        <div className="chat-interface-fixed">
            <div className="chat-messages-scroll">
                {messages.map((msg) => (
                    <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                        {msg.text}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => {
                        setInputMessage(e.target.value);
                        startListeningOnTyping();
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="chat-input"
                />
                <button onClick={handleSendMessage} className="send-button">
                    Send
                </button>
            </div>
            <audio ref={audioRef} />
        </div>
    );
};

const MiddleSection = () => {
    const [videoIndex, setVideoIndex] = useState(VIDEO_THINKING);

    return (
        <div className="middle-section-grid">
            <AgentDisplay videoIndex={videoIndex} />
            <div className="left-column-content">
                <OrderDetails />
                <ChatInterface setVideoIndex={setVideoIndex} videoIndex={videoIndex} />
            </div>
        </div>
    );
};

export default MiddleSection;