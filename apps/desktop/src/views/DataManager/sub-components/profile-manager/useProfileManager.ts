/* @layer renderer-components @kind hook */
import { useState } from 'react';
import { useCreateProfile } from './useCreateProfile';
import { useProfileForm } from './useProfileForm';
import { useProfileLists } from './useProfileLists';
import type { UseProfileManagerParams } from './profile-manager.type';

const useProfileManager = ({ profiles, romStatuses, onCreateProfile, onRefresh }: UseProfileManagerParams) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const form = useProfileForm();
  const { languages, msuPacks, settings } = useProfileLists(creating, selected);

  const readyRoms = romStatuses.filter((r) => r.hasAssets || r.extractionStatus === 'ready');
  const selectedProfile = profiles.find((p) => p.id === selected);

  const handleCreate = useCreateProfile({ form, onCreateProfile, onRefresh, setCreating });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleCreate();
    if (e.key === 'Escape') { e.preventDefault(); setCreating(false); }
  };

  return {
    selected, setSelected,
    creating, setCreating,
    form,
    languages, msuPacks,
    settings,
    readyRoms,
    selectedProfile,
    handleCreate,
    handleKeyDown,
  };
};

export { useProfileManager };
