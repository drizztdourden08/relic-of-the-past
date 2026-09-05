/* @layer bridge-wasm @kind types */
/** Types for the delivery queue, which holds item deliveries that wait until the player can receive them. */

interface DeliveryEntry {
  id: string;
  /** Human-readable message shown in the queue indicator */
  message: string;
  /** Source tag: 'cheat', 'randomizer', player name, etc. */
  source: string;
  /** The action to execute when the player can receive */
  action: DeliveryAction;
  /** Timestamp when enqueued */
  enqueuedAt: number;
  /**
   * Fired once the game has FULLY consumed the delivery and is ready for the next item
   * (WasmCanReceiveItem went false during the message/pickup and back true), or on timeout.
   * The simulator awaits this so trigger() paces the runner off real completion, not the
   * synchronous flag write.
   */
  onComplete?: () => void;
}

type DeliveryAction =
  | { type: 'give_item'; itemId: number }
  | { type: 'trigger_check'; roomId: number; chestIndex: number; itemId: number }
  | { type: 'trigger_npc_check'; flagType: number; flagMask: number; itemId: number; spriteType: number; postGfx: number }
  | { type: 'custom'; execute: () => void };

interface DeliveryQueueState {
  pending: DeliveryEntry[];
  delivering: DeliveryEntry | null;
}

type StateListener = (state: DeliveryQueueState) => void;

export type { DeliveryEntry, DeliveryAction, DeliveryQueueState, StateListener };
