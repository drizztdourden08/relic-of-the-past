/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../../design-system/primitives/Box';
import { Button } from '../../../../../../../design-system/primitives/Button';
import type { CalibrationLogProps } from './CalibrationLog.type';

const S: Record<string, CSSProperties> = {
  titleRow: { display: 'flex', gap: 8, alignItems: 'center' },
  log: { maxHeight: 150 },
  pre: { whiteSpace: 'pre-wrap' },
};

const CalibrationLog = (props: CalibrationLogProps) => {
  const { log, logRef } = props;
  const copyLog = useCallback(() => navigator.clipboard.writeText(log.join('\n')), [log]);

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title" style={S.titleRow}>
        Log
        <Button variant="tertiary" size="sm" onClick={copyLog}>Copy</Button>
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
