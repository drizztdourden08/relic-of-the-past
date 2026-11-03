/* @layer renderer-components @kind types */
interface PlayToggleButtonsProps {
  subject: string;
  playLabel: string;
  hasReplacement: boolean;
  playing: boolean;
  stoppable?: boolean;
  playingOriginal: boolean;
  onPlay: () => void;
  onStop: () => void;
  onPlayOriginal: () => void;
}

export type { PlayToggleButtonsProps };
