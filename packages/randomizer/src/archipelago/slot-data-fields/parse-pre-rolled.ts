/* @layer shared-game @kind logic */
import { isRecord } from './is-record';
import type { RotpPreRolled } from '../slot-data.type';

const parsePreRolled = (raw: unknown): RotpPreRolled | undefined => {
  if (!isRecord(raw)) return undefined;
  const { pondDemands, shopPrices, capacity, deliverable } = raw;
  return {
    ...(pondDemands !== undefined ? { pondDemands } : {}),
    ...(shopPrices !== undefined ? { shopPrices } : {}),
    ...(capacity !== undefined ? { capacity } : {}),
    ...(deliverable !== undefined ? { deliverable } : {}),
  };
};

export { parsePreRolled };
