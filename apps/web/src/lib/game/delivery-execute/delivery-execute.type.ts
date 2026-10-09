/* @layer bridge-wasm @kind types */
import type { DeliveryAction } from '../delivery-queue/delivery-queue.type';

type ExecuteOutcome = 'done' | 'refused' | 'settled';

type GiveItemAction = Extract<DeliveryAction, { type: 'give_item' }>;

type TriggerNpcCheckAction = Extract<DeliveryAction, { type: 'trigger_npc_check' }>;

export type { ExecuteOutcome, GiveItemAction, TriggerNpcCheckAction };
