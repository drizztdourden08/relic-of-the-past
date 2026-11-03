/* @layer renderer-app @kind types */
import type { RotpSlotData } from '@rotp/randomizer';

type SlotProbe = { ok: true; slotData: RotpSlotData } | { ok: false; error: string };

interface ProbeTarget {
  url: string;
  slot: string;
  password: string | null;
}

interface ProbeAttempt {
  result: SlotProbe;
  opened: boolean;
}

export type { ProbeAttempt, ProbeTarget, SlotProbe };
