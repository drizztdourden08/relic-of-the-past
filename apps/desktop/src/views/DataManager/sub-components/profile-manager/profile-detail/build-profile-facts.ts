/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import { MODE_BADGE_LABELS } from '@app/compounds/ModeBadge';
import type { ProfileModeId } from '@app/compounds/ModeBadge';

const lastPlayedFact = (lastPlayed: number, t: I18n['t']): FactsPanelFact => ({
  label: t('data-manager:profile-detail.profile.last-played'),
  value: lastPlayed ? formatDate(lastPlayed, 'relative') : t('data-manager:profile-detail.profile.never'),
  title: lastPlayed ? formatDate(lastPlayed, 'datetime') : undefined,
});

const buildProfileFacts = (profile: Profile, mode: ProfileModeId, t: I18n['t']): FactsPanelFact[] => [
  { label: t('data-manager:profile-detail.profile.rom'), value: profile.romFile, title: profile.romFile },
  { label: t('data-manager:profile-detail.profile.mode'), value: MODE_BADGE_LABELS[mode] },
  { label: t('data-manager:profile-detail.profile.created'), value: formatDate(profile.created, 'datetime') },
  lastPlayedFact(profile.lastPlayed, t),
  { label: t('data-manager:profile-detail.profile.id'), value: profile.id, mono: true, copyable: true },
];

export { buildProfileFacts };
