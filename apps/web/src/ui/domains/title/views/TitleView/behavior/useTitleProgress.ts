/* @layer renderer-hud @kind hook */
/**
 * The sword tier and the world the title shows for this profile, from its battery save on disk,
 * read once per mount. The default picture when the setting is off, the save is missing, or the
 * read fails.
 */
import { useEffect, useState } from 'react';
import type { TitleProgress } from '@shared/game/title/title-frame.type';
import { DEFAULT_PROGRESS, mostAdvancedSave } from '@shared/game/title/title-progress';
import { slotBlockOffset, validSramSlots } from '@app/lib/game/save-file/sram-slots';
import * as savesStore from '@app/lib/storage/saves-store';

const READER = { validSlots: validSramSlots, blockOffset: slotBlockOffset };

const useTitleProgress = (profileId: string | null, follows: boolean): TitleProgress => {
  const [progress, setProgress] = useState<TitleProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    let cancelled = false;
    if (!follows || !profileId) {
      setProgress(DEFAULT_PROGRESS);
      return;
    }
    savesStore.readSram(profileId)
      .then((buf) => { if (!cancelled) setProgress(buf ? mostAdvancedSave(new Uint8Array(buf), READER) : DEFAULT_PROGRESS); })
      .catch(() => { if (!cancelled) setProgress(DEFAULT_PROGRESS); });
    return () => { cancelled = true; };
  }, [profileId, follows]);

  return progress;
};

export { useTitleProgress };
