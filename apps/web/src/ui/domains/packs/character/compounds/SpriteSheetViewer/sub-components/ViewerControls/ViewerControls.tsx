/* @layer renderer-components @kind component */
/** The view switch, the animation's play, pause and step, its speed, and the zoom. */
import { Box, Button, RangeInput, SegmentedControl, Text } from '@ds/primitives';
import { VIEW_OPTIONS, MIN_SCALE, MAX_SCALE } from '../../SpriteSheetViewer.constants';
import type { AnimationClock } from '../../../../behavior/useAnimationClock';
import type { SheetView } from '../../SpriteSheetViewer.type';

type ViewerControlsProps = {
  view: SheetView;
  clock: AnimationClock;
  scale: number;
  onView: (view: SheetView) => void;
  onScale: (scale: number) => void;
};

const ViewerControls = (props: ViewerControlsProps) => {
  const { view, clock, scale, onView, onScale } = props;

  return (
    <Box className="sprite-viewer__controls">
      <SegmentedControl value={view} options={VIEW_OPTIONS} onChange={onView} />
      <Button variant="ghost" size="sm" onClick={() => clock.setPlaying(!clock.playing)}>
        {clock.playing ? 'Pause' : 'Play'}
      </Button>
      <Button variant="ghost" size="sm" onClick={clock.stepOnce}>Step</Button>
      <Text className="sprite-viewer__control-label">{clock.fps} fps</Text>
      <RangeInput
        min={clock.MIN_FPS}
        max={clock.MAX_FPS}
        value={clock.fps}
        onChange={(e) => clock.setFps(Number(e.target.value))}
      />
      <Text className="sprite-viewer__control-label">Zoom {scale}x</Text>
      <RangeInput
        min={MIN_SCALE}
        max={MAX_SCALE}
        value={scale}
        onChange={(e) => onScale(Number(e.target.value))}
      />
    </Box>
  );
};

export { ViewerControls };
export type { ViewerControlsProps };
