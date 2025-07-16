import React, { useState, useRef, useEffect } from 'react';
import './MiddleSection.css';

// AgentDisplay remains the same, but its placement changes
const AgentDisplay = () => (
  <div className="agent-display">
    {/* Video replaces the agent image, loops, autoplays, and is muted */}
    <video
      src="/src/assets/animatedVideo/thinking_1.mp4"
      className="agent-img"
      autoPlay
      loop
      muted
      playsInline
    />
  </div>
);

// OrderDetails remains the same, but its placement changes
const OrderDetails = () => (
  <div className="order-details">
    <h3>Order Details</h3>
    {/* Dynamic order list will go here */}
    <div className="order-placeholder">No items yet.</div>
  </div>
);

// ChatInterface remains the same, but its placement changes
const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I help you choose your perfect ice cream today?", sender: 'agent' },
    { id: 2, text: "I'm feeling a bit down, what do you suggest?", sender: 'user' },
    { id: 3, text: "For a little pick-me-up, I'd recommend our 'Sunshine Citrus Sorbet' or 'Double Chocolate Delight'!", sender: 'agent' },
    { id: 4, text: "Hmm, what's in the 'Sunshine Citrus Sorbet'?", sender: 'user' },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
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
      }, 800);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
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
          onChange={(e) => setInputMessage(e.target.value)}
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

// --- Updated MiddleSection Component Structure ---
const MiddleSection = () => (
  <div className="middle-section-grid">
    {/* Right Column: Agent Display (full height) */}
    <AgentDisplay />
    {/* Left Column: Order Details (top) + Chat Interface (bottom) */}
    <div className="left-column-content">
      <OrderDetails />
      <ChatInterface />
    </div>
  </div>
);

export default MiddleSection;