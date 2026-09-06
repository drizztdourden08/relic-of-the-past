/* @layer renderer-components @kind component */
// Presentational: handed a report and draws it. No "overlapping" marker; two rows ARE the overlap.
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { layerMeters } from '../behavior/layerMeters';
import { MeterRow } from './MeterRow';
import type { LayerMeterProps } from '../PreviewReadout.type';

const LayerMeter = (props: LayerMeterProps) => {
  const { report, showName = false } = props;
  const meters = layerMeters(report);

  return (
    <Box className="layer-meter" data-sounding={report.sounding ? 'yes' : 'no'}>
      <Box className="layer-meter__head">
        <Box className="layer-meter__pulse" />
        {showName && <Text className="layer-meter__name">{report.layerName}</Text>}
        <Text className="layer-meter__mode">{report.modeKind}</Text>
      </Box>
      <Box className="layer-meter__rows">
        {meters.voices.map((row) => <MeterRow key={row.id} row={row} />)}
        {meters.next !== null && <MeterRow row={meters.next} />}
      </Box>
    </Box>
  );
};

export { LayerMeter };
