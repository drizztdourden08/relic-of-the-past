/* @layer renderer-components @kind component */
import { Button, Slider } from '@drizztdourden08/tessera/primitives';
import type { PlaybackControlsProps } from '../SpriteSheetViewer.type';

const fpsText = (fps: number): string => `${fps} fps`;

const PlaybackControls = (props: PlaybackControlsProps) => {
  const { clock } = props;

  return (
    <>
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
    </>
  );
};

export { PlaybackControls };
