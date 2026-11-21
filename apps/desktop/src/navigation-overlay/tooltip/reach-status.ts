/* @layer renderer-components @kind logic */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { ReachState, TilePassability } from '@rotp/game-core';
import { optionText } from '@rotp/randomizer';
import type { ReachStatus } from './tooltip.type';

const reachStatusFor = (reach: ReachState, collision: TilePassability, isAboveLayer: boolean): ReachStatus => {
  if (reach === 1) return { label: optionText(msg('views-navigation:overlay.reach.reachable')), tone: 'ok' };
  if (reach >= 2) return { label: optionText(msg('views-navigation:overlay.reach.traversal')), tone: 'warn' };
  if (isAboveLayer && collision.type !== 'blocked') return { label: optionText(msg('views-navigation:overlay.reach.unsupported')), tone: 'bad' };
  return { label: optionText(msg('views-navigation:overlay.reach.blocked')), tone: 'bad' };
};

export { reachStatusFor };
