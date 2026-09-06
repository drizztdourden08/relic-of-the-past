/* @layer shared-game @kind logic */
/**
 * Native receive-item id range guard. The core's grant tables (message,
 * value and graphic tables indexed by the receive id) hold exactly 76
 * entries, so 0x00-0x4B are the only ids the engine can grant — the chest
 * path additionally treats a high-bit id as its did-not-open sentinel, and
 * the direct-grant export refuses anything past 0x4B. Every id a resolver
 * hands to an override or delivery must pass this check.
 */
const NATIVE_RECEIVE_TABLE_SIZE = 76;

const isNativeReceiveId = (id: number): boolean =>
  Number.isInteger(id) && id >= 0 && id < NATIVE_RECEIVE_TABLE_SIZE;

/** Narrows to a grantable id — anything outside the native table becomes undefined. */
const asNativeReceiveId = (id: number | undefined): number | undefined =>
  (id !== undefined && isNativeReceiveId(id) ? id : undefined);

export { NATIVE_RECEIVE_TABLE_SIZE, asNativeReceiveId, isNativeReceiveId };
