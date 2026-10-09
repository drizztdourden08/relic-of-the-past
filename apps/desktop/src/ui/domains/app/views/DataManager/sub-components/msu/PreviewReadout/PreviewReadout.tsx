/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { usePreviewReport } from '../behavior/usePreviewReport';
import { clock } from '@domains/packs/music/behavior/clock';
import { LayerMeter } from './sub-components/LayerMeter';
import './PreviewReadout.css';
import type { PreviewReadoutProps } from './PreviewReadout.type';

const PreviewReadout = (props: PreviewReadoutProps) => {
  const { store, previewKey, label } = props;
  const report = usePreviewReport(store, previewKey);

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
