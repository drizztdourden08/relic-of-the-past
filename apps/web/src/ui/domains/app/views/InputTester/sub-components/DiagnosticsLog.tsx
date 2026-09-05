/* @layer renderer-components @kind component */

import { type RefObject, type CSSProperties } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import type { EventEntry } from './useInputCalibration';

const TITLE_ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' };

interface DiagnosticsLogProps {
  events: EventEntry[];
  controllerDiag: string[];
  logRef: RefObject<HTMLDivElement | null>;
}

const DiagnosticsLog = (props: DiagnosticsLogProps) => {
  const { events, controllerDiag, logRef } = props;

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__section-title" style={TITLE_ROW}>
        Diagnostics
        <Button
          variant="tertiary"
          size="sm"
          onClick={() => {
            const lines = [
              ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} ${ev.id}`),
              ...controllerDiag,
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
            [{new Date(ev.time).toLocaleTimeString()}] {ev.type.toUpperCase()} {ev.id}
          </Box>
        ))}
        {controllerDiag.map((entry, i) => (
          <Box key={`hid-${i}`} className="input-cal__log-entry">
            {entry}
          </Box>
        ))}
        {events.length === 0 && controllerDiag.length === 0 && (
          <Box className="input-cal__log-entry">Waiting for controller activity...</Box>
        )}
      </Box>
    </Box>
  );
};

export { DiagnosticsLog };
