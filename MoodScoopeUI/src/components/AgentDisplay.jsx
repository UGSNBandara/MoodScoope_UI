import React, { useEffect, useRef, useState } from 'react';
import './MiddleSection.css';
import LoadingOverlay from './LoadingOverlay';
import { useMood } from '../context/MoodContext';
import videoListening from '../assets/animatedVideo/waiting.mp4';
import videoTalking from '../assets/animatedVideo/talking.mp4';
import videoThinking from '../assets/animatedVideo/relaxing.mp4';
import poster from '../assets/agent3.jpg';

const videos = [videoThinking, videoListening, videoTalking];

const AgentDisplay = ({ videoIndex }) => {
  const currentVideoRef = useRef(null);
  const nextVideoRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(videoIndex);
  const [opacities, setOpacities] = useState({ current: 1, next: 0 });
  const { isLoading } = useMood();

  useEffect(() => {
    if (videoIndex !== activeIndex) {
      const nextEl = nextVideoRef.current;
      const curEl = currentVideoRef.current;

      if (nextEl) {
        nextEl.src = videos[videoIndex];
        nextEl.load();
        nextEl.currentTime = 0;
      }

      const handleCanPlay = () => {
        if (nextEl) nextEl.play().catch(() => {});
        setOpacities({ current: 0, next: 1 });
        const t = setTimeout(() => {
          setActiveIndex(videoIndex);
          setOpacities({ current: 1, next: 0 });
          if (curEl && curEl.src !== videos[videoIndex]) curEl.src = '';
        }, 200);
        return () => clearTimeout(t);
      };

      if (nextEl) nextEl.addEventListener('canplaythrough', handleCanPlay);
      return () => {
        if (nextEl) nextEl.removeEventListener('canplaythrough', handleCanPlay);
      };
    }
  }, [videoIndex, activeIndex]);

  useEffect(() => {
    const activeEl = currentVideoRef.current;
    if (activeEl) {
      activeEl.loop = true;
      activeEl.muted = true;
      activeEl.playsInline = true;
      activeEl.play().catch(() => {});
    }
  }, [activeIndex]);

  return (
    <div className="agent-display">
  {isLoading && <LoadingOverlay />}
      <video
        ref={currentVideoRef}
        src={videos[activeIndex]}
        className="agent-img active-video"
        style={{ opacity: opacities.current, filter: 'brightness(1.1) contrast(1.05)' }}
      />

      {videoIndex !== activeIndex && (
        <video
          ref={nextVideoRef}
          poster={poster}
          className="agent-img next-video"
          style={{ opacity: opacities.next, filter: 'brightness(1.2) contrast(1.05)' }}
          muted
          playsInline
          loop
          preload="auto"
        />
      )}
    </div>
  );
};

export default AgentDisplay;
