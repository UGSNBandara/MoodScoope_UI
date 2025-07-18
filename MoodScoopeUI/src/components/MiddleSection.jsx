import React, { useState, useRef, useEffect } from 'react';
import './MiddleSection.css';
import videoListening from "../assets/animatedVideo/listning_1.mp4";
import videoTalking from "../assets/animatedVideo/talking_1.mp4";
import videoThinking from "../assets/animatedVideo/thinking_1.mp4";
import poster from "../assets/image.png";

const VIDEO_THINKING = 0;
const VIDEO_LISTENING = 1;
const VIDEO_TALKING = 2;

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

      //load next video
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

      // Listen for canplaythrough on the next video
      if (nextVideoElement) {
        nextVideoElement.addEventListener('canplaythrough', handleCanPlayThrough);
      }

      // Cleanup function for the effect
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
            filter: 'brightness(1.2) contrast(1.05)' // Add filter here
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
    { id: 1, text: "Hello! How can I help you choose your perfect ice cream today?", sender: 'agent' },
    { id: 2, text: "I'm feeling a bit down, what do you suggest?", sender: 'user' },
    { id: 3, text: "For a little pick-me-up, I'd recommend our 'Sunshine Citrus Sorbet' or 'Double Chocolate Delight'!", sender: 'agent' },
    { id: 4, text: "Hmm, what's in the 'Sunshine Citrus Sorbet'?", sender: 'user' },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null); // Ref to hold the timeout for thinking state

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //to enter the thinking mood if no activities
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


  const handleSendMessage = () => {
    if (inputMessage.trim()) {

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      setVideoIndex(VIDEO_TALKING);

      
      const newMessage = {
        id: messages.length + 1,
        text: inputMessage,
        sender: 'user',
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');

      setTimeout(() => {
        const agentResponse = {
          id: messages.length + 2,
          text: `Got it! You said: "${inputMessage}". How else can I assist?`,
          sender: 'agent',
        };
        setMessages((prevMessages) => [...prevMessages, agentResponse]);

        setTimeout(() => {
          setVideoIndex(VIDEO_LISTENING);
        }, 5000);
      }, 800);
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