/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import type { TitleProgress } from '@rotp/game-data';
import { DEFAULT_PROGRESS, mostAdvancedSave } from '@rotp/game-data';
import * as savesStore from '@app/lib/storage/saves-store';
import { SRAM_READER } from '../TitleView.constants';

const useTitleProgress = (profileId: string | null, follows: boolean): TitleProgress => {
  const [progress, setProgress] = useState<TitleProgress>(DEFAULT_PROGRESS);

  useEffect(() => {
    let cancelled = false;
    if (!follows || !profileId) {
      setProgress(DEFAULT_PROGRESS);
      return;
    }
    savesStore.readSram(profileId)
      .then((buf) => { if (!cancelled) setProgress(buf ? mostAdvancedSave(new Uint8Array(buf), SRAM_READER) : DEFAULT_PROGRESS); })
      .catch(() => { if (!cancelled) setProgress(DEFAULT_PROGRESS); });
    return () => { cancelled = true; };
  }, [profileId, follows]);

  return progress;
};

export { useTitleProgress };
