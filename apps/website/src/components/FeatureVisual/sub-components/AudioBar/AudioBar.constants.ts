/* @layer website-site @kind constants */
const AUDIO_ICON_PATHS = {
  play: 'M8 5v14l11-7z',
  pause: 'M6 5h4v14H6zM14 5h4v14h-4z',
} as const;

const AUDIO_ICON_VIEW_BOX = '0 0 24 24';

const AUDIO_TEXT = {
  play: 'Play',
  pause: 'Pause',
  position: 'Track position',
} as const;

const PROGRESS_VAR = '--audio-progress';

const SEEK_STEP_SECONDS = 5;

const SEEK_DIRECTIONS: Readonly<Record<string, number>> = { ArrowRight: 1, ArrowLeft: -1 };

export { AUDIO_ICON_PATHS, AUDIO_ICON_VIEW_BOX, AUDIO_TEXT, PROGRESS_VAR, SEEK_DIRECTIONS, SEEK_STEP_SECONDS };
