/* @layer bridge-wasm @kind types */
import type { NameTables } from './ap-names';
import type { ApPrintJsonPacket } from './ap-protocol.type';
import type { NoticePart } from './online-notices';

interface PrintSide {
  names: NameTables;
  slot: number | null;
  team: number | null;
}

interface SlotContext {
  packet: ApPrintJsonPacket;
  side: PrintSide;
  from: number;
  own: boolean;
  who: NoticePart;
}

export type { PrintSide, SlotContext };
