import React from 'react';
import './MiddleSection.css';
import { MoodProvider, useMood } from '../context/MoodContext';
import AgentDisplay from './AgentDisplay';
import ChatInterface from './ChatInterface';
import OrderDetails from './OrderDetails';
import LoadingOverlay from './LoadingOverlay';

const InnerMiddle = () => {
        const { videoIndex } = useMood();
        return (
            <div className="middle-section-grid">
                <AgentDisplay videoIndex={videoIndex} />
            <div className="left-column-content">
                <OrderDetails />
                <ChatInterface />
            </div>
        </div>
    );
};

const MiddleSection = () => (
    <MoodProvider>
        <InnerMiddle />
    </MoodProvider>
);

export default MiddleSection;