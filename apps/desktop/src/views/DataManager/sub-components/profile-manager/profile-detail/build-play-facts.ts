/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatDate } from '@drizztdourden08/tessera/primitives';
import { formatDuration } from '@app/compounds/PlaySessionCard/behavior/format-duration';
import type { ProfileData } from './profile-data.type';

const buildPlayFacts = ({ sessions }: ProfileData, t: I18n['t']): FactsPanelFact[] => {
  const played = sessions.reduce((sum, session) => sum + session.durationMs, 0);
  const latest = sessions[0];
  return [
    { label: t('data-manager:profile-detail.play.sessions'), value: String(sessions.length) },
    { label: t('data-manager:profile-detail.play.time'), value: sessions.length === 0 ? t('data-manager:profile-detail.play.none-yet') : formatDuration(played) },
    { label: t('data-manager:profile-detail.play.last'), value: latest ? formatDate(latest.startedAt, 'datetime', { length: 'medium' }) : t('data-manager:profile-detail.play.never') },
  ];
};

export { buildPlayFacts };
