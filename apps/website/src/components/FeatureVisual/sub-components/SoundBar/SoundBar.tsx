/* @layer website-site @kind component */
import { Box, Pressable, Span, Svg, SvgPath } from '../../../../design';
import { formatTime } from '../SoundPlayer/behavior/format-time';
import { keepPointer } from '../SoundPlayer/behavior/keep-pointer';
import { shield } from '../SoundPlayer/behavior/shield';
import { SOUND_ICON_PATHS, SOUND_ICON_VIEW_BOX, SOUND_TEXT } from '../SoundPlayer/SoundPlayer.constants';
import type { SoundBarProps } from './SoundBar.type';
import './SoundBar.css';

const SoundBar = ({ view, onToggle, onMute, onSeekPointer, onSeekKey }: SoundBarProps) => {
  const share = view.duration > 0 ? Math.min(view.time / view.duration, 1) : 0;

  return (
    <Box className="sound-bar">
      <Pressable
        className="sound-bar__button"
        aria-label={view.playing ? SOUND_TEXT.pause : SOUND_TEXT.play}
        onClick={shield(onToggle)}
        onPointerDown={keepPointer}
      >
        <Svg viewBox={SOUND_ICON_VIEW_BOX} fill="currentColor" aria-hidden="true" className="sound-bar__icon">
          <SvgPath d={view.playing ? SOUND_ICON_PATHS.pause : SOUND_ICON_PATHS.play} />
        </Svg>
      </Pressable>
      <Box
        role="slider"
        tabIndex={0}
        aria-label={SOUND_TEXT.position}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(share * 100)}
        aria-valuetext={formatTime(view.time)}
        className="sound-bar__track"
        onClick={onSeekPointer}
        onKeyDown={onSeekKey}
        onPointerDown={keepPointer}
      >
        <Box className="sound-bar__fill" aria-hidden="true" style={{ width: `${share * 100}%` }} />
      </Box>
      <Span className="sound-bar__time">{`${formatTime(view.time)} / ${formatTime(view.duration)}`}</Span>
      <Pressable
        className="sound-bar__button"
        aria-label={view.muted ? SOUND_TEXT.unmute : SOUND_TEXT.mute}
        aria-pressed={view.muted}
        onClick={shield(onMute)}
        onPointerDown={keepPointer}
      >
        <Svg viewBox={SOUND_ICON_VIEW_BOX} fill="currentColor" aria-hidden="true" className="sound-bar__icon">
          <SvgPath d={view.muted ? SOUND_ICON_PATHS.muted : SOUND_ICON_PATHS.volume} />
        </Svg>
      </Pressable>
    </Box>
  );
};

export { SoundBar };
