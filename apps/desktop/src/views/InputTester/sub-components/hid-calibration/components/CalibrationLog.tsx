/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Button } from '@drizztdourden08/tessera/primitives';
import type { CalibrationLogProps } from './CalibrationLog.type';
import './CalibrationLog.css';

const CalibrationLog = (props: CalibrationLogProps) => {
  const { log, logRef } = props;
  const copyLog = useCallback(() => navigator.clipboard.writeText(log.join('\n')), [log]);

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title hid-cal__log-title">
        Log
        <Button variant="tertiary" size="sm" onClick={copyLog}>Copy</Button>
      </Box>
      <Box ref={logRef} className="input-cal__log hid-cal__log-box">
        {log.length === 0 && <Box className="input-cal__log-entry">Waiting...</Box>}
        {log.map((entry, i) => (
          <Box key={i} className="input-cal__log-entry hid-cal__log-line">{entry}</Box>
        ))}
      </Box>
    </Box>
  );
};

export { CalibrationLog };
