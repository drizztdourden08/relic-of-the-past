/**
 * DiagnosticsLog — Displays controller event log and HID diagnostics.
 */

import { type RefObject } from 'react';
import type { EventEntry } from './useInputCalibration';

interface DiagnosticsLogProps {
  events: EventEntry[];
  webHidDiag: string[];
  logRef: RefObject<HTMLDivElement | null>;
}

const DiagnosticsLog = (props: DiagnosticsLogProps) => {
  const { events, webHidDiag, logRef } = props;

  return (
    <div className="input-cal__section">
      <div className="input-cal__section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        Diagnostics
        <button
          className="input-cal__btn"
          style={{ fontSize: 'var(--text-xs)', padding: '2px 8px' }}
          onClick={() => {
            const lines = [
              ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} \u2014 ${ev.id}`),
              ...webHidDiag,
            ];
            navigator.clipboard.writeText(lines.join('\n'));
          }}
        >
          Copy
        </button>
      </div>
      <div className="input-cal__log" ref={logRef}>
        {events.map((ev, i) => (
          <div key={`ev-${i}`} className={`input-cal__log-entry input-cal__log-entry--${ev.type}`}>
            [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} {'\u2014'} {ev.id}
          </div>
        ))}
        {webHidDiag.map((entry, i) => (
          <div key={`hid-${i}`} className="input-cal__log-entry">
            {entry}
          </div>
        ))}
        {events.length === 0 && webHidDiag.length === 0 && (
          <div className="input-cal__log-entry">Waiting for controller activity...</div>
        )}
      </div>
    </div>
  );
};

export { DiagnosticsLog };
