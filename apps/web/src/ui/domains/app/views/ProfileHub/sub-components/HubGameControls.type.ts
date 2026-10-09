/* @layer renderer-components @kind types */
interface HubGameControlsProps {
  isGameRunning: boolean;
  showPlay: boolean;
  size?: 'sm' | 'md';
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

export type { HubGameControlsProps };
