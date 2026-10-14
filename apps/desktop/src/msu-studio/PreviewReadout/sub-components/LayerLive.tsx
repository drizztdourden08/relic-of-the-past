/* @layer renderer-components @kind component */
import { usePreviewReport } from '../../behavior/usePreviewReport';
import { LayerMeter } from './LayerMeter';
import type { LayerLiveProps } from '../PreviewReadout.type';

const LayerLive = (props: LayerLiveProps) => {
  const { store, previewKey, layerId } = props;
  const report = usePreviewReport(store, previewKey);
  const layer = report?.layers.find((entry) => entry.layerId === layerId) ?? null;

  if (layer === null) return null;

  return <LayerMeter report={layer} />;
};

export { LayerLive };
