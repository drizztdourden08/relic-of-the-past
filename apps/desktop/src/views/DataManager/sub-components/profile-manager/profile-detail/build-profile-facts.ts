/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatDate, formatRelativeTime } from '@drizztdourden08/brock-core';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import type { ProfileModeId } from '@app/compounds/ModeBadge';

const buildProfileFacts = (profile: Profile, mode: ProfileModeId): FactsPanelFact[] => [
  { label: 'ROM', value: profile.romFile, title: profile.romFile },
  { label: 'Mode', value: MODE_BADGE_LABELS[mode] },
  { label: 'Created', value: formatDate(profile.created, 'long') },
  { label: 'Last played', value: formatRelativeTime(profile.lastPlayed), title: formatDate(profile.lastPlayed, 'long') },
  { label: 'Profile ID', value: profile.id, mono: true, copyable: true },
];

export { buildProfileFacts };
