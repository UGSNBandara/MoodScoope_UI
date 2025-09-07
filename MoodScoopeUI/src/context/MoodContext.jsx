import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { base64toBlob, delay } from '../utils/media';

const MoodContext = createContext(null);

export const VIDEO_THINKING = 0;
export const VIDEO_LISTENING = 1;
export const VIDEO_TALKING = 2;

export const MoodProvider = ({ children }) => {
  const [videoIndex, setVideoIndexState] = useState(VIDEO_THINKING);
  const idleTimerRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [userId, setUserId] = useState('u1');
  // selectedCategory is shared so components (chat/agent) can control the sidebar
  const [selectedCategory, setSelectedCategory] = useState(null);
  // jumpTarget is used to ask the UI to jump to a specific item (categoryIndex, itemIndex)
  const [jumpTarget, setJumpTarget] = useState(null);

  const jumpToItem = (categoryIndex, itemIndex) => {
    setJumpTarget({ categoryIndex, itemIndex });
  };

  useEffect(() => {
    // ensure idle timer is set on mount to transition to THINKING after inactivity
    touchActivity();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);

  const handleIdle = () => {
    // when idle occurs, set thinking and clear session
    setVideoIndexState(VIDEO_THINKING);
    setSessionId(null);
  };

  const touchActivity = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    // after 60s of no activity set thinking and clear session
    idleTimerRef.current = setTimeout(handleIdle, 60 * 1000);
  };

  const setVideoIndex = (idx) => {
    setVideoIndexState(idx);
    touchActivity();
  };
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello wellcome You can talk with me using message box and voice', sender: 'agent' },
    { id: 3, text: 'Press the voice recording icon to send voice, Thank you', sender: 'agent' },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function sendUserMessage(text) {
    if (!text || !text.trim()) return null;
    const userMsg = { id: Date.now(), text, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);

  // show loading overlay while backend processes (do not change agent mood)
  setIsLoading(true);

    try {
      const payload = {
        user_id: userId,
        text,
        session_id: sessionId,
        speak: true,
      };

      const response = await fetch('http://127.0.0.1:8000/agent/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      // store session id if returned
      if (data.session_id) setSessionId(data.session_id);

      const respText = data.response || data.text || '';
      // append agent message text
      setMessages((prev) => [...prev, { id: Date.now() + 1, text: respText, sender: 'agent' }]);

      // --- NEW: call menu index endpoint once after receiving agent response ---
      try {
        const sid = data.session_id || sessionId;
        if (sid) {
          const menuRes = await fetch(`http://127.0.0.1:8000/menu/index/${sid}`, { method: 'GET', headers: { Accept: 'application/json' } });
          if (menuRes.ok) {
            const menuData = await menuRes.json();
            const raw = typeof menuData.index === 'number' ? menuData.index : parseInt(menuData.index);
            // backend uses 1-based indexing; convert to 0-based for frontend
            let idx = Number.isFinite(raw) ? raw - 1 : NaN;
            if (Number.isNaN(idx) || idx < 0) idx = 0;
            // use ice cream index 3 as requested
            const iceIndex = 3;
            if (!Number.isNaN(idx) && idx !== selectedCategory) {
              // ask UI to jump to the requested category and item
              jumpToItem(idx, iceIndex);
            }
          } else {
            console.warn('menu index fetch failed', menuRes.status);
          }
        }
      } catch (err) {
        console.error('menu index fetch error:', err);
      }

      let audioUrl = null;
      if (data.audio_base64) {
        const mime = data.audio_mime || 'audio/mpeg';
        const audioBlob = base64toBlob(data.audio_base64, mime);
        audioUrl = window.URL.createObjectURL(audioBlob);
      }

      // Return audio URL and responseText
      return { audioUrl, sessionId: data.session_id || sessionId, responseText: respText };
    } catch (err) {
      setMessages((prev) => [...prev, { id: Date.now() + 2, text: 'Sorry, there was an error processing your request. Please try again.', sender: 'agent' }]);
      setVideoIndex(VIDEO_LISTENING);
      console.error('sendUserMessage error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return (
  <MoodContext.Provider value={{ videoIndex, setVideoIndex, messages, setMessages, isLoading, sendUserMessage, sessionId, setSessionId, userId, setUserId, selectedCategory, setSelectedCategory, jumpTarget, setJumpTarget, jumpToItem }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = () => {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
};

export default MoodContext;
