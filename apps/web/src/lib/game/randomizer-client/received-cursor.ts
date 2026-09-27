/* @layer bridge-wasm @kind logic */
/**
 * Where the client is in the server's received list, between the queue and the save. The save
 * keeps how many items it holds (received-index.ts), and that number moves only when the game
 * confirms a grant, in list order. Items handed to the queue and not granted yet sit between
 * the saved index and `queued`, so a repeated list does not queue them twice.
 *
 * A grant can land out of step with the list (an own pickup echo settles at once, a queued item
 * later), so each settled position is kept until every one before it has settled too; the
 * saved index then moves over the whole run. A save swap resets the cursor, and `epoch` tells a
 * grant queued before the swap that it no longer counts.
 *
 * A batch is handed on in its own order (received-batch-order.ts), so a position can be handed
 * on before the ones in front of it. Such a position waits in `handed` until the run in front of
 * it is handed on too, and a repeated list skips it meanwhile.
 */

interface ReceivedCursor {
  /** One past the last list position handed on in a row; never read below the saved index. */
  queued: number;
  /** Positions past `queued` already handed on, ahead of the ones in front of them. */
  readonly handed: Set<number>;
  /** Positions at or past the saved index that settled before the ones in front of them. */
  readonly settled: Set<number>;
  epoch: number;
}

const createReceivedCursor = (): ReceivedCursor => ({ queued: 0, handed: new Set(), settled: new Set(), epoch: 0 });

/** The save changed under the client: nothing queued before counts any more. */
const resetCursor = (cursor: ReceivedCursor): void => {
  cursor.queued = 0;
  cursor.handed.clear();
  cursor.settled.clear();
  cursor.epoch += 1;
};

/** The first list position not yet handed on, given the save's own index. */
const nextToQueue = (cursor: ReceivedCursor, saved: number): number => Math.max(cursor.queued, saved);

/** Position |index| was already handed on, in a row or ahead of the run. */
const wasHanded = (cursor: ReceivedCursor, index: number, saved: number): boolean =>
  index < nextToQueue(cursor, saved) || cursor.handed.has(index);

/** Position |index| went to the queue; `queued` moves over every handed position in a row. */
const markHanded = (cursor: ReceivedCursor, index: number, saved: number): void => {
  cursor.queued = nextToQueue(cursor, saved);
  cursor.handed.add(index);
  while (cursor.handed.delete(cursor.queued)) cursor.queued += 1;
};

/** Position |index| is in Link's hands; returns the saved index it lets the save move to. */
const settlePosition = (cursor: ReceivedCursor, index: number, saved: number): number => {
  if (index < saved) return saved;
  cursor.settled.add(index);
  let next = saved;
  while (cursor.settled.delete(next)) next += 1;
  return next;
};

export { createReceivedCursor, markHanded, nextToQueue, resetCursor, settlePosition, wasHanded };
export type { ReceivedCursor };
