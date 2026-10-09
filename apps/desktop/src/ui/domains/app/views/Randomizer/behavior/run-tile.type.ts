/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

interface TileMeter {
  value: number;
  max: number;
}

interface RunTile {
  label: string;
  value: ReactNode;
  tone?: StatusTone;
  meter?: TileMeter;
}

export type { RunTile, TileMeter };
