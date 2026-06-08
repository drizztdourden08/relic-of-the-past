/* @layer renderer-components @kind component */
/**
 * Log display for the HID Calibration Wizard.
 */

import { Box } from '../../../../../../../design-system/primitives/Box';

interface CalibrationLogProps {
  log: string[];
  logRef: React.RefObject<HTMLDivElement | null>;
}

const CalibrationLog = (props: CalibrationLogProps) => {
  const { log, logRef } = props;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        Log
        <Box as="button" className="input-cal__btn" style={{ fontSize: 10, padding: '2px 8px' }}
          onClick={() => navigator.clipboard.writeText(log.join('\n'))}>Copy</Box>
      </Box>
      <Box ref={logRef} className="input-cal__log" style={{ maxHeight: 150 }}>
        {log.length === 0 && <Box className="input-cal__log-entry">Waiting...</Box>}
        {log.map((entry, i) => (
          <Box key={i} className="input-cal__log-entry" style={{ whiteSpace: 'pre-wrap' }}>{entry}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { CalibrationLog };
