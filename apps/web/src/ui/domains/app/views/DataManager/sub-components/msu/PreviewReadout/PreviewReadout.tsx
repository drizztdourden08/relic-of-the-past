/* @layer renderer-components @kind component */
/**
 * What the slot being previewed is doing, layer by layer, live.
 *
 * It subscribes to the report store itself rather than taking a report as a prop, so a published
 * frame redraws this block alone and the slot list it sits inside stays still.
 *
 * The elapsed clock is here because it is the number `interval` layers are scheduled against —
 * their offsets are measured from the moment the track started, not from the last sound. It is
 * labelled and formatted like a clock for one reason: unlabelled seconds next to a row reading
 * "0:15 / 0:50" get read as the track's own time, so a session that has outlasted the track looks
 * like a bug in the track.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { usePreviewReport } from '../behavior/usePreviewReport';
import { clock } from '../behavior/clock';
import { LayerMeter } from './sub-components/LayerMeter';
import './PreviewReadout.css';
import type { PreviewReadoutProps } from './PreviewReadout.type';

const PreviewReadout = (props: PreviewReadoutProps) => {
  const { store, previewKey, label } = props;
  const report = usePreviewReport(store, previewKey);

  // Nothing yet: the preview is still decoding, or another row is the one playing.
  if (report === null) return null;

  return (
    <Box className="preview-readout">
      <Box className="preview-readout__head">
        <Text className="preview-readout__title">Live — {label}</Text>
        {report.detail != null && (
          <Text className="preview-readout__clock preview-readout__detail">{report.detail}</Text>
        )}
        <Text className="preview-readout__clock">elapsed {clock(report.elapsedSeconds)}</Text>
      </Box>
      {report.layers.map((layer) => (
        <LayerMeter key={layer.layerId} report={layer} showName />
      ))}
    </Box>
  );
};

export { PreviewReadout };
