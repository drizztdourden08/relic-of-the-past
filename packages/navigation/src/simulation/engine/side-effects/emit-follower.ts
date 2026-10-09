/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { narrative } from '../event-log/narrative';
import { globalRefresh } from '../explorer/global-refresh';
import type { EngineState } from '../state/state.type';
import { settleTrigger } from './settle-trigger';

const emitFollower = (s: EngineState, events: SimEvent[], key: string): void => {
  s.done.add(key);
  s.events.add('event:follower-joined');
  events.push(narrative(s, 'The follower is tagging along'));
  globalRefresh(s);
  events.push(narrative(s, 'Reset: re-exploring with the follower tagging along'));
  settleTrigger(s);
};

export { emitFollower };
