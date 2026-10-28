/* @layer website-site @kind component */
import { Box, Pressable, Svg, SvgPath, Video } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { keepPointer } from './behavior/keep-pointer';
import { shield } from './behavior/shield';
import { useSoundPlayer } from './behavior/useSoundPlayer';
import { SOUND_ICON_PATHS, SOUND_ICON_VIEW_BOX, SOUND_TEXT } from './SoundPlayer.constants';
import { SoundBar } from '../SoundBar';
import type { SoundPlayerProps } from './SoundPlayer.type';
import './SoundPlayer.css';

const SoundPlayer = ({ clip, sync, active, frame }: SoundPlayerProps) => {
  const { videoRef, view, toggle, toggleMute, seekByPointer, seekByKey, videoHandlers } = useSoundPlayer(sync, active);
  const { src, poster } = clip;

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
      {frame ? frame(video) : video}
      {view.playing ? null : (
        <Pressable className="sound-player__play" aria-label={SOUND_TEXT.play} onClick={shield(toggle)} onPointerDown={keepPointer}>
          <Svg viewBox={SOUND_ICON_VIEW_BOX} fill="currentColor" aria-hidden="true" className="sound-player__icon">
            <SvgPath d={SOUND_ICON_PATHS.play} />
          </Svg>
        </Pressable>
      )}
      {view.started ? (
        <SoundBar view={view} onToggle={toggle} onMute={toggleMute} onSeekPointer={seekByPointer} onSeekKey={seekByKey} />
      ) : null}
    </Box>
  );
};

export { SoundPlayer };
