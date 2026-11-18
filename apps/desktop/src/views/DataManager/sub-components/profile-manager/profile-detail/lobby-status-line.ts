/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { ArchipeliaMembership, LobbyLive } from '@drizztdourden08/brock-randomizer/renderer';
import type { LobbyStatusLine } from './lobby-status-line.type';

const progressLine = (live: LobbyLive | undefined, t: I18n['t']): LobbyStatusLine | null => {
  const progress = live?.progress;
  if (progress === null || progress === undefined) return null;
  const text = progress.phase === 'generating' ? t('data-manager:profile-detail.lobby-status.generating') : t('data-manager:profile-detail.lobby-status.starting');
  return { text, tone: 'neutral', busy: false, progress: progress.fraction, final: false };
};

const goneText = (m: ArchipeliaMembership, t: I18n['t']): string =>
  (m.state.kind === 'gone' && m.state.reason === 'unsupported' ? t('data-manager:profile-detail.lobby-status.unsupported', { ap: m.ap }) : t('data-manager:profile-detail.lobby-status.gone'));

const lobbyStatusLine = (m: ArchipeliaMembership, live: LobbyLive | undefined, t: I18n['t']): LobbyStatusLine => {
  const { state } = m;
  if (state.kind === 'approved') {
    return progressLine(live, t) ?? { text: t('data-manager:profile-detail.lobby-status.approved'), tone: 'success', busy: true, final: false };
  }
  if (state.kind === 'failed') return { text: t('data-manager:profile-detail.lobby-status.failed'), tone: 'warning', busy: false, final: false };
  if (state.kind === 'refused') return { text: t('data-manager:profile-detail.lobby-status.refused'), why: state.reason, tone: 'danger', busy: false, final: true };
  if (state.kind === 'gone') return { text: goneText(m, t), tone: 'danger', busy: false, final: true };
  if (state.kind === 'started') return { text: t('data-manager:profile-detail.lobby-status.open'), tone: 'success', busy: false, final: false };
  return { text: t('data-manager:profile-detail.lobby-status.waiting'), tone: 'neutral', busy: true, final: false };
};

export { lobbyStatusLine };
