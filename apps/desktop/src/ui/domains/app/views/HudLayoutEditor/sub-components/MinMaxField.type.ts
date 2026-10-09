/* @layer renderer-components @kind types */
import type { Value } from '@shared/types/hud';

type Limits = { w?: Value; h?: Value } | undefined;

interface MinMaxFieldProps {
  min: Limits;
  max: Limits;
  onMin: (next: Limits) => void;
  onMax: (next: Limits) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

export type { Limits, MinMaxFieldProps };
