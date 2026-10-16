/* @layer renderer-components @kind types */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileModeId } from '@app/compounds/ModeBadge';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

type ProfileSettings = Record<string, unknown> | null;

interface ProfileDetailPanelProps {
  profile: Profile;
  settings: ProfileSettings;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  onSelectProfile: (profile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  onRefresh: () => void;
}

interface ProfileDetailHeaderProps {
  profile: Profile;
  mode: ProfileModeId;
  onOpen: () => void;
  onDelete: () => void;
}

interface ProfileOverviewTabProps {
  profile: Profile;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  mode: ProfileModeId;
  onRefresh: () => void;
}

interface ProfileEditSectionProps {
  profile: Profile;
  languages: Array<{ code: string }>;
  msuPacks: Array<{ name: string }>;
  onRefresh: () => void;
}

interface ProfileSettingsTabProps {
  settings: ProfileSettings;
}

interface ProfileDataTabProps {
  profile: Profile;
  settings: ProfileSettings;
}

interface ProfileRandomizerTabProps {
  profile: Profile;
  randomizer: ProfileRandomizerConfig;
}

interface ProfileConnectionSectionProps {
  profile: Profile;
  randomizer: ProfileRandomizerConfig;
}

interface FactsSectionProps {
  title: string;
  hint?: string;
  facts: readonly FactsPanelFact[][];
}

export type {
  FactsSectionProps, ProfileConnectionSectionProps, ProfileDataTabProps, ProfileDetailHeaderProps, ProfileDetailPanelProps,
  ProfileEditSectionProps, ProfileOverviewTabProps, ProfileRandomizerTabProps, ProfileSettings, ProfileSettingsTabProps,
};
