/* @layer renderer-components @kind component */
import { Button, Slider } from '@drizztdourden08/tessera/primitives';
import { viewerLabelsOf } from '../behavior/viewer-labels-of';
import type { PlaybackControlsProps } from '../SpriteSheetViewer.type';

const PlaybackControls = (props: PlaybackControlsProps) => {
  const { clock, labels } = props;
  const text = viewerLabelsOf(labels);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => clock.setPlaying(!clock.playing)}>
        {clock.playing ? text.pause : text.play}
      </Button>
      <Button variant="ghost" size="sm" onClick={clock.stepOnce}>{text.step}</Button>
      <Slider
        className="sprite-viewer__slider"
        size="sm"
        aria-label={text.fpsAria}
        min={clock.MIN_FPS}
        max={clock.MAX_FPS}
        value={clock.fps}
        showValue
        formatValue={text.fps}
        onChange={clock.setFps}
      />
    </>
  );
};

export { PlaybackControls };
