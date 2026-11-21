/* @layer renderer-components @kind types */
import type { DateFormatOptions } from '@drizztdourden08/tessera/primitives';
import type { PlaySession } from '@rotp/game-core';

interface PlaySessionCardProps {
  session: PlaySession;
  dates: DateFormatOptions;
  endLabel: (time: string) => string;
}

export type {
  PlaySessionCardProps,
};
