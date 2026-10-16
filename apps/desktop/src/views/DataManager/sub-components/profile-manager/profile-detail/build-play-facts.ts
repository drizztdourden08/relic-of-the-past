/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import { formatDate } from '@drizztdourden08/brock-core';
import { formatDuration } from '@app/compounds/PlaySessionCard/behavior/format-duration';
import type { ProfileData } from './profile-data.type';

const buildPlayFacts = ({ sessions }: ProfileData): FactsPanelFact[] => {
  const played = sessions.reduce((sum, session) => sum + session.durationMs, 0);
  const latest = sessions[0];
  return [
    { label: 'Sessions', value: String(sessions.length) },
    { label: 'Play time', value: sessions.length === 0 ? 'None yet' : formatDuration(played) },
    { label: 'Last session', value: latest ? formatDate(latest.startedAt, 'session') : 'Never' },
  ];
};

export { buildPlayFacts };
