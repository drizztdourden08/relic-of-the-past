/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { usePreviewReport } from '../behavior/usePreviewReport';
import { clock } from '@rotp/design/packs';
import { LayerMeter } from './sub-components/LayerMeter';
import './PreviewReadout.css';
import type { PreviewReadoutProps } from './PreviewReadout.type';

const PreviewReadout = (props: PreviewReadoutProps) => {
  const { store, previewKey, label } = props;
  const t = useT();
  const report = usePreviewReport(store, previewKey);

  if (report === null) return null;

  return (
    <Box className="msu-accent-panel preview-readout">
      <Box className="preview-readout__head">
        <Text className="preview-readout__title">{t('msu-studio:live.title', { label })}</Text>
        {report.detail != null && (
          <Text className="preview-readout__clock preview-readout__detail">{report.detail}</Text>
        )}
        <Text className="preview-readout__clock">{t('msu-studio:live.elapsed', { time: clock(report.elapsedSeconds) })}</Text>
      </Box>
      {report.layers.map((layer) => (
        <LayerMeter key={layer.layerId} report={layer} showName />
      ))}
    </Box>
  );
};

export { PreviewReadout };
