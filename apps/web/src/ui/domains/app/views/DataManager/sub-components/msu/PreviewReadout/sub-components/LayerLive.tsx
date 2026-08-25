/* @layer renderer-components @kind component */
/**
 * The same live line, for one named layer, to sit beside that layer's card while it is edited.
 *
 * It subscribes on its own behalf, which is what lets the card stay presentational: the card is
 * handed this element as a slot and never learns that an engine exists, and a published frame
 * redraws this one line rather than the card's inputs.
 *
 * A layer only just added in the editor has not been saved, so the engine is not playing it and
 * there is nothing to draw — that is the null case below, not an error.
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
