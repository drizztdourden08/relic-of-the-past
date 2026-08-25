/* @layer renderer-components @kind component */
/**
 * One layer's live block: which layer it is, how it is scheduled, and a stacked row for every
 * sound audible right now plus one for what is being waited for. Purely presentational — it is
 * handed a report and draws it, so the same piece serves the readout under a slot and the one
 * beside a layer card.
 *
 * There is no separate "overlapping" marker any more: each sound has its own named row, so two
 * rows ARE the overlap, and a count beside the layer name would only restate what is already on
 * screen. The head keeps the layer's identity and nothing that a row now carries better.
 */
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
