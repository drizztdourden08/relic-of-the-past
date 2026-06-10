/* @layer renderer-components @kind component */
/**
 * DiagnosticsLog — Displays controller event log and HID diagnostics.
 */

import { type RefObject, type CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import type { EventEntry } from './useInputCalibration';

const TITLE_ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' };

interface DiagnosticsLogProps {
  events: EventEntry[];
  webHidDiag: string[];
  logRef: RefObject<HTMLDivElement | null>;
}

const DiagnosticsLog = (props: DiagnosticsLogProps) => {
  const { events, webHidDiag, logRef } = props;

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__section-title" style={TITLE_ROW}>
        Diagnostics
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => {
            const lines = [
              ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} \u2014 ${ev.id}`),
              ...webHidDiag,
            ];
            navigator.clipboard.writeText(lines.join('\n'));
          }}
        >
          Copy
        </Button>
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
