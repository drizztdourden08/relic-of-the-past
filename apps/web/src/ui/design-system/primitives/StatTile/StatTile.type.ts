/* @layer renderer-components @kind types */
import type { ReactNode } from 'react';

/** A count out of the most it could be, drawn as a thin bar under the value. */
interface StatTileMeter {
  value: number;
  max: number;
}

/** A value that is a state: good, needs a look, or wrong. */
type StatTileTone = 'ok' | 'warn' | 'bad';

interface StatTileProps {
  label: string;
  value: ReactNode;
  meter?: StatTileMeter;
  tone?: StatTileTone;
  title?: string;
  className?: string;
}

export type { StatTileMeter, StatTileProps, StatTileTone };
