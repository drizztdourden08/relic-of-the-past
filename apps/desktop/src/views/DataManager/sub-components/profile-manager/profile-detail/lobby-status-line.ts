/* @layer renderer-components @kind logic */
import type { ArchipeliaMembership } from '@app/game/archipelia';
import type { LobbyLive } from '@app/stores/lobby-status-store';
import type { LobbyStatusLine } from './lobby-status-line.type';

const progressLine = (live: LobbyLive | undefined): LobbyStatusLine | null => {
  const progress = live?.progress;
  if (progress === null || progress === undefined) return null;
  const text = progress.phase === 'generating' ? 'Generating' : 'Starting the room';
  return { text, tone: 'neutral', busy: false, progress: progress.fraction, final: false };
};

const goneText = (m: ArchipeliaMembership): string =>
  (m.state.kind === 'gone' && m.state.reason === 'unsupported' ? `This RotP no longer supports Archipelago ${m.ap}` : 'The lobby is gone');

const lobbyStatusLine = (m: ArchipeliaMembership, live: LobbyLive | undefined): LobbyStatusLine => {
  const { state } = m;
  if (state.kind === 'approved') {
    return progressLine(live) ?? { text: 'Approved. Waiting for the host to start', tone: 'success', busy: true, final: false };
  }
  if (state.kind === 'failed') return { text: 'The host\'s generation failed. Waiting for the host.', tone: 'warning', busy: false, final: false };
  if (state.kind === 'refused') return { text: 'The host refused this player', why: state.reason, tone: 'danger', busy: false, final: true };
  if (state.kind === 'gone') return { text: goneText(m), tone: 'danger', busy: false, final: true };
  if (state.kind === 'started') return { text: 'The room is open', tone: 'success', busy: false, final: false };
  return { text: 'Waiting for the host to approve', tone: 'neutral', busy: true, final: false };
};

export { lobbyStatusLine };
