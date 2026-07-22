/* @layer bridge-wasm @kind logic */
/**
 * Delivery Queue — manages item deliveries that must wait until Link can receive them.
 * Polls WasmCanReceiveItem each frame; when ready, delivers the next item in FIFO order.
 * Fires callbacks so the UI can display pending/delivered state.
 */

import { getModule } from './wasm-bridge';
import { log } from '../log-bus';
import type { DeliveryEntry, DeliveryAction, DeliveryQueueState, StateListener } from './delivery-queue.type';

// ─── Queue Implementation ───

let queue: DeliveryEntry[] = [];
let delivering: DeliveryEntry | null = null;
let rafId: number | null = null;
let listeners: Set<StateListener> = new Set();
let nextId = 0;
let cooldownFrames = 0;
// Whether the in-flight delivery has been observed to make the game busy (WasmCanReceiveItem
// false). We only complete once it goes busy THEN ready again, so an item still incoming can't
// resolve on the same frame it executed. Frames counted since execute, for the stuck-delivery timeout.
let deliveringBecameBusy = false;
let deliveringFrames = 0;

const DELIVERY_COOLDOWN = 30; // frames between deliveries (~0.5s at 60fps)
// Safety cap so a delivery that never reports ready again can't hang a simulator run forever
// (~10s at 60fps). On timeout we log and complete anyway.
const DELIVERY_TIMEOUT_FRAMES = 600;

const generateId = (): string => {
  return `dlv_${Date.now()}_${nextId++}`;
};

const getState = (): DeliveryQueueState => {
  return { pending: [...queue], delivering };
};

const notify = (): void => {
  const state = getState();
  for (const listener of listeners) {
    try { listener(state); } catch { /* ignore */ }
  }
};

const canReceive = (): boolean => {
  const mod = getModule();
  if (!mod) return false;
  return mod.ccall('WasmCanReceiveItem', 'number', [], []) === 1;
};

const executeAction = (action: DeliveryAction): void => {
  const mod = getModule();
  if (!mod) return;

  switch (action.type) {
    case 'give_item':
      mod.ccall('WasmCheatGiveItem', null, ['number'], [action.itemId]);
      break;
    case 'trigger_check':
      mod.ccall('WasmTriggerCheck', null, ['number', 'number', 'number'],
        [action.roomId, action.chestIndex, action.itemId]);
      break;
    case 'trigger_npc_check':
      mod.ccall('WasmTriggerNpcCheck', null, ['number', 'number', 'number', 'number', 'number'],
        [action.flagType, action.flagMask, action.itemId, action.spriteType, action.postGfx]);
      break;
    case 'custom':
      action.execute();
      break;
  }
};

const tick = (): void => {
  rafId = requestAnimationFrame(tick);

  if (cooldownFrames > 0) {
    cooldownFrames--;
    return;
  }

  if (delivering) {
    deliveringFrames++;
    const ready = canReceive();
    if (!ready) deliveringBecameBusy = true;
    const timedOut = deliveringFrames >= DELIVERY_TIMEOUT_FRAMES;
    // Complete only once the game actually consumed the item (busy → ready), or on timeout so a
    // stuck delivery can't hang the run. Resolving here — not at execute time — is what makes the
    // simulator's trigger() wait for the pickup + item-get dialog to fully finish.
    if ((ready && deliveringBecameBusy) || timedOut) {
      const done = delivering;
      delivering = null;
      cooldownFrames = DELIVERY_COOLDOWN;
      notify();
      if (timedOut && !ready) log.app(`Delivery "${done.message}" timed out waiting for pickup to finish`, 'warn');
      try { done.onComplete?.(); } catch { /* ignore */ }
    }
    return;
  }

  if (queue.length === 0) return;
  if (!canReceive()) return;

  // Deliver next item
  const entry = queue.shift()!;
  delivering = entry;
  deliveringBecameBusy = false;
  deliveringFrames = 0;
  notify();
  executeAction(entry.action);
};

// ─── Public API ───

const enqueue = (message: string, source: string, action: DeliveryAction, onComplete?: () => void): string => {
  const entry: DeliveryEntry = {
    id: generateId(),
    message,
    source,
    action,
    enqueuedAt: Date.now(),
    onComplete,
  };
  queue.push(entry);
  notify();
  return entry.id;
};

const remove = (id: string): boolean => {
  const idx = queue.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  queue.splice(idx, 1);
  notify();
  return true;
};

const clear = (): void => {
  // Resolve any awaited completions so a dropped delivery can't leave the simulator's trigger()
  // promise hanging forever.
  const dropped = delivering ? [delivering, ...queue] : [...queue];
  queue = [];
  delivering = null;
  deliveringBecameBusy = false;
  deliveringFrames = 0;
  cooldownFrames = 0;
  notify();
  for (const entry of dropped) {
    try { entry.onComplete?.(); } catch { /* ignore */ }
  }
};

const peek = (): DeliveryEntry | undefined => {
  return queue[0];
};

const size = (): number => {
  return queue.length;
};

const subscribe = (listener: StateListener): () => void => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const startProcessing = (): void => {
  if (rafId != null) return;
  rafId = requestAnimationFrame(tick);
};

const stopProcessing = (): void => {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
};

const deliveryQueue = {
  enqueue,
  remove,
  clear,
  peek,
  size,
  subscribe,
  getState,
  startProcessing,
  stopProcessing,
};

export { enqueue, remove, clear, peek, size, subscribe, startProcessing, stopProcessing, deliveryQueue };
export type { DeliveryEntry, DeliveryAction, DeliveryQueueState } from './delivery-queue.type';
