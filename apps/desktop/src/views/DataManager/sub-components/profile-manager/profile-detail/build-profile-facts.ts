/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import type { ProfileModeId } from '@app/compounds/ModeBadge';

const lastPlayedFact = (lastPlayed: number): FactsPanelFact => ({
  label: 'Last played',
  value: lastPlayed ? formatDate(lastPlayed, 'relative') : 'Never',
  title: lastPlayed ? formatDate(lastPlayed, 'datetime') : undefined,
});

const buildProfileFacts = (profile: Profile, mode: ProfileModeId): FactsPanelFact[] => [
  { label: 'ROM', value: profile.romFile, title: profile.romFile },
  { label: 'Mode', value: MODE_BADGE_LABELS[mode] },
  { label: 'Created', value: formatDate(profile.created, 'datetime') },
  lastPlayedFact(profile.lastPlayed),
  { label: 'Profile ID', value: profile.id, mono: true, copyable: true },
];

export { buildProfileFacts };
