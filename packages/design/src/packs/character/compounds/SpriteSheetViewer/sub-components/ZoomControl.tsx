/* @layer renderer-components @kind component */
import { Slider } from '@drizztdourden08/tessera/primitives';
import { MIN_SCALE, MAX_SCALE } from '../SpriteSheetViewer.constants';
import type { ZoomControlProps } from '../SpriteSheetViewer.type';

const zoomText = (zoom: number): string => `Zoom ${zoom}x`;

const ZoomControl = (props: ZoomControlProps) => {
  const { scale, onScale } = props;

  return (
    <Slider
      className="sprite-viewer__slider"
      size="sm"
      aria-label="Zoom"
      min={MIN_SCALE}
      max={MAX_SCALE}
      value={scale}
      showValue
      formatValue={zoomText}
      onChange={onScale}
    />
  );
};

export { ZoomControl };
