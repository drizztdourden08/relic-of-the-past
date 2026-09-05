/* @layer renderer-components @kind component */
/**
 * Subscribes on its own behalf so the layer card stays presentational and a frame redraws this
 * line, not the card's inputs. An unsaved layer is not playing yet: null, not an error.
 */
import { usePreviewReport } from '../../behavior/usePreviewReport';
import { LayerMeter } from './LayerMeter';
import '../PreviewReadout.css';
import type { LayerLiveProps } from '../PreviewReadout.type';

const LayerLive = (props: LayerLiveProps) => {
  const { store, previewKey, layerId } = props;
  const report = usePreviewReport(store, previewKey);
  const layer = report?.layers.find((entry) => entry.layerId === layerId) ?? null;

  if (layer === null) return null;

  return <LayerMeter report={layer} />;
};

export { LayerLive };
