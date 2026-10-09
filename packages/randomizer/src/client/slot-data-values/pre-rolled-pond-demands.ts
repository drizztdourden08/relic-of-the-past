/* @layer bridge-wasm @kind logic */
import { isPlainRecord } from './is-plain-record';
import type { PondDemandView } from '../../world/pond/pond-ask.type';
import type { RotpSlotData } from '../../archipelago/slot-data.type';

const preRolledPondDemands = (slotData: RotpSlotData): PondDemandView | undefined => {
  const raw = slotData.preRolled?.pondDemands;
  return isPlainRecord(raw) ? raw as PondDemandView : undefined;
};

export { preRolledPondDemands };
