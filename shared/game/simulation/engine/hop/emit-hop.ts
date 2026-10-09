/* @layer shared-game @kind logic */
import type { SimEvent, SimExit } from '../../types';
import { screenLabel } from '../screen-label';
import { narrative } from '../event-log/narrative';
import { arrivalKey } from '../regions/arrival-key';
import { crossingKey } from '../regions/crossing-key';
import type { EngineState } from '../state/state.type';
import type { ScreenEdge } from '../traversal/traversal.type';
import { arrivalLabel } from './arrival-label';
import { landingTile } from './landing-tile';
import { positionMessage } from './position-message';

const narrateAreaChange = (s: EngineState, events: SimEvent[], exit?: SimExit): void => {
  const destArea = exit?.area;
  if (s.area?.key === destArea?.key) return;
  if (s.area) events.push(narrative(s, `Leaving area ${s.area.label}`));
  if (destArea) events.push(narrative(s, `Area ${destArea.label} (${destArea.size} sub-screens)`));
  s.area = destArea;
};

const emitHop = (s: EngineState, events: SimEvent[], next: string, exit?: SimExit, edge?: ScreenEdge): void => {
  const from = s.virtual.screenId;
  events.push(narrative(s, positionMessage('END', exit?.fromTile ?? s.virtual.tile)));
  const via = exit?.via && exit.via !== from ? ` via ${screenLabel(exit.via)}` : '';
  events.push(narrative(s, `Exiting ${screenLabel(from)}${via}`));
  narrateAreaChange(s, events, exit);
  const tile = landingTile(exit, edge);
  s.virtual = { screenId: next, tile };
  if (exit) s.arrivals.add(arrivalKey(next, exit.edgeSig));
  const crossed = exit ? crossingKey(from, next, exit.edgeSig) : null;
  if (crossed) s.crossings.add(crossed);
  s.cameFrom = { screenId: from, tile };
  events.push(narrative(s, `Screen ${screenLabel(next)} ${arrivalLabel(exit?.edgeSig, tile)}`));
  events.push(narrative(s, positionMessage('START', tile)));
};

export { emitHop };
