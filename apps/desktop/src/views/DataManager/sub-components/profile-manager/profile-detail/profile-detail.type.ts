/* @layer renderer-components @kind types */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileModeId } from '@app/compounds/ModeBadge';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import type { ProfileLanguage } from '../../profile-language.type';

type ProfileSettings = Record<string, unknown> | null;

interface ProfileDetailPanelProps {
  profile: Profile;
  settings: ProfileSettings;
  languages: ProfileLanguage[];
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
  languages: ProfileLanguage[];
  msuPacks: Array<{ name: string }>;
  mode: ProfileModeId;
  onRefresh: () => void;
}

interface ProfileEditSectionProps {
  profile: Profile;
  languages: ProfileLanguage[];
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
  randomizer: ProfileRandomizerConfig;
}

interface FactsSectionProps {
  title: string;
  hint?: string;
  facts: readonly FactsPanelFact[][];
}

export type {
  FactsSectionProps, ProfileDataTabProps, ProfileDetailHeaderProps, ProfileDetailPanelProps,
  ProfileEditSectionProps, ProfileOverviewTabProps, ProfileRandomizerTabProps, ProfileSettings, ProfileSettingsTabProps,
};
