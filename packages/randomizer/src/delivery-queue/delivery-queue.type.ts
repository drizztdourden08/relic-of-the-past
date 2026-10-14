/* @layer bridge-wasm @kind types */
interface DeliveryEntry {
  id: string;
  message: string;
  source: string;
  action: DeliveryAction;
  enqueuedAt: number;
  refusals?: number;
  onComplete?: () => void;
  onGranted?: () => void;
}

type DeliveryAction =
  | {
    type: 'give_item';
    itemId: number;
    receiptExport?: boolean;
    messageId?: number;
    messageOf?: () => number;
  }
  | { type: 'quiet_receipt'; itemId: number; fallback: DeliveryAction }
  | { type: 'trigger_check'; roomId: number; chestIndex: number; itemId: number }
  | {
    type: 'trigger_npc_check'; flagType: number; flagMask: number; itemId: number; spriteType: number; postGfx: number;
    assigned?: boolean;
    messageId?: number;
  }
  | { type: 'custom'; execute: () => void };

interface DeliveryQueueState {
  pending: DeliveryEntry[];
  delivering: DeliveryEntry | null;
}

type StateListener = (state: DeliveryQueueState) => void;

type EnqueueParams = Pick<DeliveryEntry, 'message' | 'source' | 'action' | 'onComplete' | 'onGranted'>;

export type { DeliveryEntry, DeliveryAction, DeliveryQueueState, EnqueueParams, StateListener };
