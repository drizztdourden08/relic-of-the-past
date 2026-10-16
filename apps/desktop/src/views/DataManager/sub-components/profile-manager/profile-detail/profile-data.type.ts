/* @layer renderer-components @kind types */
import type { AutoSaveInfo, NormalSaveInfo, PlaySession, QuickSaveSlotInfo } from '@rotp/game-core';
import type { InputProfile } from '@rotp/input-mapping';

interface ProfileData {
  manual: NormalSaveInfo[];
  auto: AutoSaveInfo[];
  quick: QuickSaveSlotInfo[];
  sramBytes: number | null;
  sessions: PlaySession[];
  inputProfiles: InputProfile[];
}

export type { ProfileData };
