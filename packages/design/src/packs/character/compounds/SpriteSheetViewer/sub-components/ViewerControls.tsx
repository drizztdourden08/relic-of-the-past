/* @layer renderer-components @kind component */
import { Box, Button, SegmentedControl, Slider } from '@drizztdourden08/tessera/primitives';
import { VIEW_OPTIONS, MIN_SCALE, MAX_SCALE } from '../SpriteSheetViewer.constants';
import type { ViewerControlsProps } from '../SpriteSheetViewer.type';

const fpsText = (fps: number): string => `${fps} fps`;
const zoomText = (zoom: number): string => `Zoom ${zoom}x`;

const ViewerControls = (props: ViewerControlsProps) => {
  const { view, clock, scale, onView, onScale } = props;

  return (
    <Box className="sprite-viewer__controls">
      <SegmentedControl value={view} options={VIEW_OPTIONS} onChange={onView} />
      <Button variant="ghost" size="sm" onClick={() => clock.setPlaying(!clock.playing)}>
        {clock.playing ? 'Pause' : 'Play'}
      </Button>
      <Button variant="ghost" size="sm" onClick={clock.stepOnce}>Step</Button>
      <Slider
        className="sprite-viewer__slider"
        size="sm"
        aria-label="Frames per second"
        min={clock.MIN_FPS}
        max={clock.MAX_FPS}
        value={clock.fps}
        showValue
        formatValue={fpsText}
        onChange={clock.setFps}
      />
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
    </Box>
  );
};

export { ViewerControls };
