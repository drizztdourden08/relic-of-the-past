/* @layer renderer-components @kind component */
import { Slider } from '@drizztdourden08/tessera/primitives';
import { MIN_SCALE, MAX_SCALE } from '../SpriteSheetViewer.constants';
import { viewerLabelsOf } from '../behavior/viewer-labels-of';
import type { ZoomControlProps } from '../SpriteSheetViewer.type';

const ZoomControl = (props: ZoomControlProps) => {
  const { scale, onScale, labels } = props;
  const text = viewerLabelsOf(labels);

  return (
    <Slider
      className="sprite-viewer__slider"
      size="sm"
      aria-label={text.zoomAria}
      min={MIN_SCALE}
      max={MAX_SCALE}
      value={scale}
      showValue
      formatValue={text.zoom}
      onChange={onScale}
    />
  );
};

export { ZoomControl };
