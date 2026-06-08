/* @layer renderer-components @kind component */
/**
 * DiagnosticsLog — Displays controller event log and HID diagnostics.
 */

import { type RefObject } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import type { EventEntry } from './useInputCalibration';

interface DiagnosticsLogProps {
  events: EventEntry[];
  webHidDiag: string[];
  logRef: RefObject<HTMLDivElement | null>;
}

const DiagnosticsLog = (props: DiagnosticsLogProps) => {
  const { events, webHidDiag, logRef } = props;

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__section-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        Diagnostics
        <Box
          as="button"
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
        </Box>
      </Box>
      <Box className="input-cal__log" ref={logRef}>
        {events.map((ev, i) => (
          <Box key={`ev-${i}`} className={`input-cal__log-entry input-cal__log-entry--${ev.type}`}>
            [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} {'\u2014'} {ev.id}
          </Box>
        ))}
        {webHidDiag.map((entry, i) => (
          <Box key={`hid-${i}`} className="input-cal__log-entry">
            {entry}
          </Box>
        ))}
        {events.length === 0 && webHidDiag.length === 0 && (
          <Box className="input-cal__log-entry">Waiting for controller activity...</Box>
        )}
      </Box>
    </Box>
  );
};

export { DiagnosticsLog };
