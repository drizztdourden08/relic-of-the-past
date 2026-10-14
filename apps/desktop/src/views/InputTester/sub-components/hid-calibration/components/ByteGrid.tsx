/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { ByteCell } from './ByteCell';
import { ByteGridLegend } from './ByteGridLegend';
import type { ByteGridProps } from './ByteGrid.type';
import './ByteGrid.css';

const ByteGrid = (props: ByteGridProps) => {
  const { latestBytes, gyroState, stickPickMode, triggerPickMode, lastReportId } = props;

  return (
    <Box className="hid-cal__step">
      <Box className="hid-cal__step-title">Live Bytes for report 0x{lastReportId.toString(16)}</Box>
      <Box className="hid-cal__byte-grid">
        {Array.from(latestBytes).map((b, i) => <ByteCell key={i} index={i} value={b} grid={props} />)}
      </Box>
      {latestBytes.length === 0 && <Box className="hid-cal__desc">Waiting for HID reports...</Box>}
      <ByteGridLegend gyroState={gyroState} stickPickMode={stickPickMode} triggerPickMode={triggerPickMode} />
    </Box>
  );
};

export { ByteGrid };
