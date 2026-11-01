/* @layer website-site @kind types */
import type { KeyboardEvent, MouseEvent } from 'react';
import type { VideoStep } from '../../../../features';
import type { PlayerView } from '../SoundPlayer/SoundPlayer.type';

type SoundBarProps = {
  view: PlayerView;
  steps: readonly VideoStep[];
  onToggle: () => void;
  onMute: () => void;
  onSeekPointer: (event: MouseEvent<HTMLElement>) => void;
  onSeekKey: (event: KeyboardEvent<HTMLElement>) => void;
};

export type { SoundBarProps };
