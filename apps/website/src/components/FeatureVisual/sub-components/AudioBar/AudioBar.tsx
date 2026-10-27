/* @layer website-site @kind component */
import { Audio, Box, Pressable, Span, Svg, SvgPath } from '../../../../design';
import { publicFileUrl } from '../../../../public-file';
import { useAudioPlayer } from './behavior/useAudioPlayer';
import { AUDIO_ICON_PATHS, AUDIO_ICON_VIEW_BOX, AUDIO_TEXT } from './AudioBar.constants';
import type { AudioBarProps } from './AudioBar.type';
import './AudioBar.css';

const AudioBar = ({ track }: AudioBarProps) => {
  const { audioRef, barRef, playing, toggle, seekByPointer, seekByKey, audioHandlers } = useAudioPlayer();

  return (
    <Box className="audio-bar">
      <Audio ref={audioRef} src={publicFileUrl(track.src)} {...audioHandlers} />
      <Pressable className="audio-bar__toggle" aria-label={playing ? AUDIO_TEXT.pause : AUDIO_TEXT.play} onClick={toggle}>
        <Svg viewBox={AUDIO_ICON_VIEW_BOX} fill="currentColor" aria-hidden="true" className="audio-bar__icon">
          <SvgPath d={playing ? AUDIO_ICON_PATHS.pause : AUDIO_ICON_PATHS.play} />
        </Svg>
      </Pressable>
      <Span className="audio-bar__title">{track.title}</Span>
      <Box
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label={AUDIO_TEXT.position}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
        className="audio-bar__track"
        onClick={seekByPointer}
        onKeyDown={seekByKey}
      >
        <Box className="audio-bar__fill" aria-hidden="true" />
      </Box>
    </Box>
  );
};

export { AudioBar };
