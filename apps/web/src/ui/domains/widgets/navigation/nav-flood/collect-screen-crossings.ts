/* @layer renderer-widgets @kind logic */
import { collectCrossings } from '@app/lib/game/crossings';
import type { ScreenCrossings } from '@shared/game/navigation';
import type { CrossingsArgs } from './nav-flood.type';

const collectScreenCrossings = ({ isIndoors, responses, items }: CrossingsArgs): ScreenCrossings[] =>
  responses.map((response) => collectCrossings({
    isIndoors,
    roomIndex: response.screenIndex,
    owScreenIndex: response.screenIndex,
    flood: response.result,
    connections: response.connections,
    items,
  }));

export { collectScreenCrossings };
