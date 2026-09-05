/* @layer renderer-components @kind component */
/**
 * Subscribes to the report store itself so a published frame redraws this block alone. The elapsed
 * clock is what `interval` layers are scheduled against; it is labelled because unlabelled seconds
 * next to "0:15 / 0:50" read as the track's own time.
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
        <Text className="preview-readout__title">Live · {label}</Text>
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
