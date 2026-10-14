/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { DiagnosticsLogProps } from './DiagnosticsLog.type';

const DiagnosticsLog = (props: DiagnosticsLogProps) => {
  const { events, controllerDiag, logRef } = props;
  const copyLog = useCallback(() => {
    const lines = [
      ...events.map(ev => `[${new Date(ev.time).toLocaleTimeString()}] ${ev.type.toUpperCase()} ${ev.id}`),
      ...controllerDiag,
    ];
    void navigator.clipboard.writeText(lines.join('\n'));
  }, [events, controllerDiag]);

  return (
    <Box className="input-cal__section">
      <Box className="input-cal__section-title input-cal__title-row">
        Diagnostics
        <Button
          variant="tertiary"
          size="sm"
          onClick={copyLog}
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
