/* @layer renderer-components @kind component */
/**
 * Log display for the HID Calibration Wizard.
 */

import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../../design-system/primitives/Button';

const S: Record<string, CSSProperties> = {
  titleRow: { display: 'flex', gap: 8, alignItems: 'center' },
  log: { maxHeight: 150 },
  pre: { whiteSpace: 'pre-wrap' },
};

interface CalibrationLogProps {
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

const CalibrationLog = (props: CalibrationLogProps) => {
  const { log, logRef } = props;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title" style={S.titleRow}>
        Log
        <Button variant="tertiary" size="sm" onClick={() => navigator.clipboard.writeText(log.join('\n'))}>Copy</Button>
      </Box>
      <Box ref={logRef} className="input-cal__log" style={S.log}>
        {log.length === 0 && <Box className="input-cal__log-entry">Waiting...</Box>}
        {log.map((entry, i) => (
          <Box key={i} className="input-cal__log-entry" style={S.pre}>{entry}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { CalibrationLog };
