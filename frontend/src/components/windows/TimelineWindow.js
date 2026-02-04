import React from 'react';
import Window from '../Window/Window';
import { WINDOW_TYPES } from '../../context/WindowContext';
import Timeline from '../Timeline/Timeline';

const TimelineWindow = () => {
  return (
    <Window id={WINDOW_TYPES.TIMELINE} className="window-timeline">
      <Timeline />
    </Window>
  );
};

export default TimelineWindow;