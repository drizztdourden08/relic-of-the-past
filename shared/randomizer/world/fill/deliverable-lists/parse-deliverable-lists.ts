/* @layer shared-game @kind logic */
import type { LocationKey } from '../../location-key';
import type { DeliverableLists } from '../fill.type';

const isKeyList = (value: unknown): value is LocationKey[] =>
  Array.isArray(value) && value.every((key) => typeof key === 'string');

const parseDeliverableLists = (raw: unknown): DeliverableLists | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined;
  const { npc, pond, world } = raw as Record<string, unknown>;
  if (!isKeyList(npc) || !isKeyList(pond) || !isKeyList(world)) return undefined;
  return { npc, pond, world };
};

export { parseDeliverableLists };
