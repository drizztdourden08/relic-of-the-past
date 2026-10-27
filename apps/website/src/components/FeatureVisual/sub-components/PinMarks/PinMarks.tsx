/* @layer website-site @kind component */
import { Box, Span } from '@drizztdourden08/tessera/primitives';
import type { PinMarksProps } from './PinMarks.type';
import './PinMarks.css';

const PinMarks = ({ callouts }: PinMarksProps) => (
  <Box className="pin-marks" aria-hidden="true">
    {callouts.map((callout, index) => (
      <Span key={callout.label} className="pin-marks__pin" style={{ left: `${callout.x}%`, top: `${callout.y}%` }}>
        {index + 1}
      </Span>
    ))}
  </Box>
);

export { PinMarks };
