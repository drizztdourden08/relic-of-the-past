/* @layer website-site @kind constants */
import type { PlaybackSync } from './SoundPlayer.type';

const SOUND_ICON_PATHS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
  volume: 'M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z',
  muted:
    'M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z',
} as const;

const SOUND_ICON_VIEW_BOX = '0 0 24 24';

const SOUND_TEXT = {
  play: 'Play',
  pause: 'Pause',
  mute: 'Mute',
  unmute: 'Unmute',
  position: 'Video position',
} as const;

const SEEK_STEP_SECONDS = 5;

const SEEK_DIRECTIONS: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

const SECONDS_PER_MINUTE = 60;

const START_SYNC: PlaybackSync = { time: 0, playing: false, muted: false };

export { SECONDS_PER_MINUTE, SEEK_DIRECTIONS, SEEK_STEP_SECONDS, SOUND_ICON_PATHS, SOUND_ICON_VIEW_BOX, SOUND_TEXT, START_SYNC };
