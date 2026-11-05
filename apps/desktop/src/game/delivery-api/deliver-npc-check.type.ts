/* @layer bridge-wasm @kind types */
import type { DeliverySink } from './delivery-sink.type';

type DeliverNpcCheckParams = {
  flagType: number;
  flagMask: number;
  itemId: number;
  spriteType: number;
  postGfx: number;
  message?: string;
  source?: string;
  messageId?: number;
  sink?: DeliverySink;
};

export type { DeliverNpcCheckParams };
