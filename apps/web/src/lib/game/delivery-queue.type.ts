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
   * Times the core synchronously refused this entry's receipt grant (status 0 from
   * WasmGrantItemWithReceipt). Maintained by the queue; a refused entry stays at the
   * front and retries, so it is never dropped and never completed as delivered.
   */
  refusals?: number;
  /**
   * Fired once the game has FULLY consumed the delivery and is ready for the next item
   * (WasmCanReceiveItem went false during the message/pickup and back true), or on timeout.
   * The simulator awaits this so trigger() paces the runner off real completion, not the
   * synchronous flag write.
   */
  onComplete?: () => void;
  /**
   * Fired once, the moment the core confirms the grant (the action executed and was not
   * refused). Never for a refused attempt and never for an entry removed or cleared before it
   * executed, so it counts exactly the items that reached the player.
   */
  onGranted?: () => void;
}

type DeliveryAction =
  | {
    type: 'give_item';
    itemId: number;
    /**
     * True routes the grant through the receipt export (WasmGrantItemWithReceipt,
     * gated by kFeatures3_ReceiptExport), the randomizer delivery path
     * (delivery-api.ts) sets it. Absent/false keeps the cheat export
     * (WasmCheatGiveItem): the cheats UI and the simulator run under the cheat/sim
     * gates and must not silently move to a gate their sessions never arm.
     */
    receiptExport?: boolean;
    /**
     * Optional contextual receipt-message id (RANDOMIZER_RECEIPT_MSG, or a raw
     * dialogue message index) armed as a one-shot right before the grant executes.
     * Omitted: the core derives a class default from the item id. Only meaningful
     * with receiptExport.
     */
    messageId?: number;
    /**
     * Answers the message id when the entry reaches the front of the queue, for a line composed
     * only then (a received item's line, server-delivery.ts). Asked on every attempt, so a retry
     * after a refusal gets the same id. Wins over |messageId|.
     */
    messageOf?: () => number;
  }
  /**
   * Quiet receipts: the rupees, bombs or arrows of receipt |itemId| go straight to the wallet, bag
   * or quiver (WasmGrantQuietReceipt), no hold-up and no message, so the entry completes the moment
   * the core confirms it. When the core answers that the receipt is not quiet (its option was
   * turned off after the entry was queued), |fallback| runs in its place: the ordinary receipt.
   */
  | { type: 'quiet_receipt'; itemId: number; fallback: DeliveryAction }
  | { type: 'trigger_check'; roomId: number; chestIndex: number; itemId: number }
  | {
    type: 'trigger_npc_check'; flagType: number; flagMask: number; itemId: number; spriteType: number; postGfx: number;
    /**
     * True marks itemId as the host's final answer for the check (the randomizer
     * delivery path), so the core's npc-override seam is bypassed for the grant.
     * Absent/false replays the giver's vanilla grant (the cheats UI passes the
     * dataset's native item), which an armed npc-override table may substitute.
     */
    assigned?: boolean;
    /**
     * Optional contextual receipt-message id armed as a one-shot right before
     * the trigger executes, same contract as give_item's messageId.
     */
    messageId?: number;
  }
  | { type: 'custom'; execute: () => void };

interface DeliveryQueueState {
  pending: DeliveryEntry[];
  delivering: DeliveryEntry | null;
}

type StateListener = (state: DeliveryQueueState) => void;

export type { DeliveryEntry, DeliveryAction, DeliveryQueueState, StateListener };
