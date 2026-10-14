/* @layer renderer-widgets @kind logic */
import { IN_PLAY_REASON } from '../../../CheatsWidget.constants';
import type { CounterKind } from '../PlayerTab.type';

const counterLocks = (kind: CounterKind, inPlay: boolean): { held: string | undefined; max: string | undefined } => ({
  held: kind === 'keys' && !inPlay ? IN_PLAY_REASON : undefined,
  max: inPlay ? undefined : IN_PLAY_REASON,
});

export { counterLocks };
