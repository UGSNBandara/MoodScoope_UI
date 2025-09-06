import React, { useRef, useEffect } from 'react';
import './MiddleSection.css';
import { useMood, VIDEO_LISTENING, VIDEO_TALKING } from '../context/MoodContext';

const ChatInterface = () => {
  const { messages, sendUserMessage, setVideoIndex, videoIndex, isLoading } = useMood();
  const audioRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // no-op effect kept out; keep component lightweight

  const handleSend = async (textInputEl) => {
    const text = textInputEl?.value;
    if (!text || !text.trim()) return;
    const res = await sendUserMessage(text);
  textInputEl.value = '';
    if (res && res.audioUrl) {
      setVideoIndex(VIDEO_TALKING);
      const audioEl = audioRef.current;
      audioEl.src = res.audioUrl;
      audioEl.play().catch((e) => console.error('audio play error', e));
      const onEnded = () => {
        setVideoIndex(VIDEO_LISTENING);
        window.URL.revokeObjectURL(res.audioUrl);
        audioEl.removeEventListener('ended', onEnded);
      };
      audioEl.addEventListener('ended', onEnded);
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
          placeholder="Type your message..."
          className="chat-input"
          ref={inputRef}
          onFocus={() => { if (videoIndex !== VIDEO_TALKING) setVideoIndex(VIDEO_LISTENING); }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSend(inputRef.current);
          }}
        />
        <button onClick={() => handleSend(inputRef.current)} className="send-button" disabled={isLoading}>
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
      <audio ref={audioRef} />
    </div>
  );
};

export default ChatInterface;
