/* @layer website-site @kind component */
import { Box, Pressable, Svg, SvgPath, Video } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { currentStepIndex } from './behavior/current-step';
import { keepPointer } from './behavior/keep-pointer';
import { shield } from './behavior/shield';
import { useSoundPlayer } from './behavior/useSoundPlayer';
import { NO_STEPS, SOUND_ICON_PATHS, SOUND_ICON_VIEW_BOX, SOUND_TEXT } from './SoundPlayer.constants';
import { SoundBar } from '../SoundBar';
import { SoundCaption } from '../SoundCaption';
import { StepList } from '../StepList';
import type { SoundPlayerProps } from './SoundPlayer.type';
import './SoundPlayer.css';

const SoundPlayer = ({ clip, sync, active, steps = NO_STEPS, listed = false, frame }: SoundPlayerProps) => {
  const { videoRef, view, toggle, toggleMute, playAt, seekByPointer, seekByKey, videoHandlers } = useSoundPlayer(sync, active);
  const { src, poster } = clip;
  const current = currentStepIndex(steps, view.time);
  const step = steps[current];

  const video = (
    <Video
      key={src}
      ref={videoRef}
      src={publicFileUrl(src)}
      poster={publicFileUrl(poster.src)}
      width={poster.width}
      height={poster.height}
      muted={view.muted}
      preload="metadata"
      aria-label={poster.alt}
      {...videoHandlers}
    />
  );

  return (
    <Box className="sound-player">
      <Box className="sound-player__stage">
        {frame ? frame(video) : video}
        {view.playing ? null : (
          <Pressable className="sound-player__play" aria-label={SOUND_TEXT.play} onClick={shield(toggle)} onPointerDown={keepPointer}>
            <Svg viewBox={SOUND_ICON_VIEW_BOX} fill="currentColor" aria-hidden="true" className="sound-player__icon">
              <SvgPath d={SOUND_ICON_PATHS.play} />
            </Svg>
          </Pressable>
        )}
        {view.started && step ? <SoundCaption label={step.label} /> : null}
        {view.started ? (
          <SoundBar
            view={view}
            steps={steps}
            onToggle={toggle}
            onMute={toggleMute}
            onSeekPointer={seekByPointer}
            onSeekKey={seekByKey}
          />
        ) : null}
      </Box>
      {listed ? <StepList steps={steps} current={current} onSelect={playAt} /> : null}
    </Box>
  );
};

export { SoundPlayer };
