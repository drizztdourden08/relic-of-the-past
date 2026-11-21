/* @layer renderer-components @kind types */
import type { LanguageSummary } from '@rotp/asset-extraction';
import type { useProfileManager } from './useProfileManager';

interface UseProfileManagerParams {
  profiles: Profile[];
  romStatuses: RomDisplayInfo[];
  onRefresh: () => void;
}

type ProfileManagerState = ReturnType<typeof useProfileManager>;

interface ProfileListPaneProps {
  manager: ProfileManagerState;
  profiles: Profile[];
  loadingProfile?: string | null;
  onOpen: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

interface ProfileRowsProps {
  profiles: Profile[];
  selected: string | null;
  onSelect: (id: string) => void;
  onOpen: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

interface NamedLanguage extends LanguageSummary {
  name: string;
}

export type { NamedLanguage, ProfileListPaneProps, ProfileRowsProps, UseProfileManagerParams };
