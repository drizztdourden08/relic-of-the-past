/* @layer renderer-widgets @kind logic */
import { collectCrossings } from '@rotp/navigation';
import type { ScreenCrossings } from '@rotp/game-core';
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
