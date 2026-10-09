/* @layer shared-game @kind logic */
import type { SimEvent } from '../../types';
import { narrative } from '../event-log/narrative';
import { spendAnyKey } from '../explorer/spend-any-key';
import type { EngineState } from '../state/state.type';
import { refloodHere } from './reflood-here';
import { settleTrigger } from './settle-trigger';

const emitDoorUnlock = (s: EngineState, events: SimEvent[], label: string, key: string, spendsKey: boolean): void => {
  if (spendsKey) spendAnyKey(s);
  s.done.add(key);
  events.push(narrative(s, `Unlocked ${label}`));
  refloodHere(s, events);
  settleTrigger(s);
};

export { emitDoorUnlock };
