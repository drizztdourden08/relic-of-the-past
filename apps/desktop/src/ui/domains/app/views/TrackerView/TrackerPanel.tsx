/* @layer renderer-components @kind component */
import { useState } from 'react';
import type { TrackerPanelProps } from './types';

const TrackerPanel = ({ panelSettings, children, className = '', onDragStart }: TrackerPanelProps) => {
  const [hovered, setHovered] = useState(false);
  const { mode, side, opacity } = panelSettings;

  const frameOpacity = hovered ? 1 : opacity;

  const cls = [
    'tracker-panel',
    `tracker-panel--${mode}`,
    mode === 'docked' && `tracker-panel--${side}`,
    className,
  ].filter(Boolean).join(' ');

  const style: React.CSSProperties = {
    '--tracker-frame-opacity': frameOpacity,
    ...(mode === 'floating' ? { left: panelSettings.x, top: panelSettings.y } : {}),
  } as React.CSSProperties;

  return (
    <div
      className={cls}
      style={style}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
};

export { TrackerPanel };
