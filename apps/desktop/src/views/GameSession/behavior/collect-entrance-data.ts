/* @layer renderer-appshell @kind logic */
import type { EntranceDataInput } from './dump-nav.type';
import { findMatchingEntrances } from './find-matching-entrances';
import { findFallHoleLandings } from './find-fall-hole-landings';

const collectEntranceData = (input: EntranceDataInput) => {
  const { roomIndex } = input;
  const origin = { x: (roomIndex % 16) * 512, y: Math.floor(roomIndex / 16) * 512 };

  return {
    matchingEntrances: findMatchingEntrances(input, origin),
    fallHoleLandings: findFallHoleLandings(input, origin),
  };
};

export { collectEntranceData };
