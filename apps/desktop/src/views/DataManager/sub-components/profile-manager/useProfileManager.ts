/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useCreateFlow } from '@app/hooks/useCreateFlow';
import { useProfileLists } from './useProfileLists';
import type { UseProfileManagerParams } from './profile-manager.type';

const useProfileManager = ({ profiles, romStatuses, onRefresh }: UseProfileManagerParams) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { creating, start, cancel, select, listCollapsed, setListCollapsed } = useCreateFlow({ onSelect: setSelected });
  const { languages, msuPacks, settings } = useProfileLists(creating, selected);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  useEffect(() => {
    if (selected === null) return;
    if (selectedProfile !== undefined) {
      if (pendingId === selected) setPendingId(null);
    } else if (pendingId !== selected) setSelected(null);
  }, [selected, selectedProfile, pendingId]);

  const finishCreating = useCallback((profileId: string) => {
    setPendingId(profileId);
    select(profileId);
    onRefresh();
  }, [onRefresh, select]);

  return {
    selected, select,
    creating, startCreating: start, stopCreating: cancel, finishCreating,
    listCollapsed, setListCollapsed,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
  };
};

export { useProfileManager };
