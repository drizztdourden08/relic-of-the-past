/* @layer website-site @kind types */
import type { TimelineEntry } from '../../../../features';

type TimelineSlotProps = {
  entries: readonly TimelineEntry[];
  activeId: string | null;
  ariaLabel: string;
  onJump: (id: string) => void;
};

export type { TimelineSlotProps };
