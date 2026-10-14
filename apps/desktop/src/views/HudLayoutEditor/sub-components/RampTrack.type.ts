/* @layer renderer-components @kind types */
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { GradientStop } from '@rotp/hud';

interface RampTrackProps {
  stops: readonly GradientStop[];
  kind: 'linear' | 'radial';
  index: number;
  onSelect: (index: number) => void;
  onCommit: (next: GradientStop[], keep: GradientStop) => void;
  onAddAt: (at: number) => void;
  onNudge: (event: ReactKeyboardEvent<HTMLButtonElement>) => void;
}

export type { RampTrackProps };
