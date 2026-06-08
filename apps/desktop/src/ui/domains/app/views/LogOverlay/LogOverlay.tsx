/* @layer renderer-components @kind component */
import { useRef } from 'react';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { useLogOverlay } from './behavior/useLogOverlay';
import { formatTime } from './behavior/formatTime';
import { CHANNEL_COLORS } from '../../../../../lib/log-bus';
import './LogOverlay.css';
import type { LogOverlayProps } from './types';


const LogOverlay = (props: LogOverlayProps) => {
  const { visible: externalVisible, onClose } = props;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { visible: f12Visible, setVisible: setF12Visible, entries } = useLogOverlay(bottomRef);

  const show = externalVisible || f12Visible;
  if (!show) return null;

  const handleClose = () => {
    setF12Visible(false);
    onClose();
  };

  return (
    <div className="log-overlay">
      <div className="log-overlay__header">
        <span className="log-overlay__title">Log</span>
        <span className="log-overlay__hint">F12 to toggle</span>
        <IconButton variant="ghost" size="sm" label="Open DevTools" onClick={() => window.api.openDevTools()}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2 2h5v1H3v10h10V8h1v6H2V2zm6.5 4.5L5 10l-.7-.7L7.8 6H5.5v-1H9v3.5H8V6.5z"/>
          </svg>
        </IconButton>
        <IconButton variant="ghost" size="sm" label="Close logs" onClick={handleClose}>
          <svg width="10" height="10" viewBox="0 0 14 14" fill="currentColor">
            <path d="M1.5 0.5L7 6L12.5 0.5L13.5 1.5L8 7L13.5 12.5L12.5 13.5L7 8L1.5 13.5L0.5 12.5L6 7L0.5 1.5Z" />
          </svg>
        </IconButton>
      </div>
      <div className="log-overlay__body">
        {entries.map((entry, i) => (
          <div key={`${entry.id}-${i}`} className={`log-entry log-entry--${entry.level}`}>
            <span className="log-entry__time">{formatTime(entry.timestamp)}</span>
            <span className="log-entry__channel" style={{ color: CHANNEL_COLORS[entry.channel] }}>
              {entry.channel}:
            </span>
            <span className="log-entry__message">{entry.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export { LogOverlay };
