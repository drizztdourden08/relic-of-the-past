/* @layer renderer-components @kind types */
import type { GradientStop } from '@rotp/hud';

interface GradientRampProps {
  stops: readonly GradientStop[];
  onChange: (next: GradientStop[]) => void;
  kind: 'linear' | 'radial';
}

export type { GradientRampProps };
