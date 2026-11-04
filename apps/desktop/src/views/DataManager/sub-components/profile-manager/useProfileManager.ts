/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useState } from 'react';
import { useProfileLists } from './useProfileLists';
import type { UseProfileManagerParams } from './profile-manager.type';

const useProfileManager = ({ profiles, romStatuses, onRefresh }: UseProfileManagerParams) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [listCollapsed, setListCollapsed] = useState(false);
  const { languages, msuPacks, settings } = useProfileLists(creating, selected);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  useEffect(() => {
    if (selected === null) return;
    if (selectedProfile !== undefined) {
      if (pendingId === selected) setPendingId(null);
    } else if (pendingId !== selected) setSelected(null);
  }, [selected, selectedProfile, pendingId]);

  const startCreating = useCallback(() => {
    setCreating(true);
    setListCollapsed(true);
  }, []);

  const stopCreating = useCallback(() => {
    setCreating(false);
    setListCollapsed(false);
  }, []);

  const select = useCallback((id: string) => {
    setSelected(id);
    stopCreating();
  }, [stopCreating]);

  const finishCreating = useCallback((profileId: string) => {
    setPendingId(profileId);
    setSelected(profileId);
    stopCreating();
    onRefresh();
  }, [onRefresh, stopCreating]);

  return {
    selected, select,
    creating, startCreating, stopCreating, finishCreating,
    listCollapsed, setListCollapsed,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
  };
};

export { useProfileManager };
