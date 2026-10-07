/* @layer bridge-wasm @kind logic */
/**
 * Delivery Queue: manages item deliveries that must wait until the player can receive them.
 * Polls WasmCanReceiveItem each frame; when ready, delivers the next item in FIFO order.
 * Fires callbacks so the UI can display pending/delivered state.
 */

import { getModule } from './wasm-bridge';
import { log } from '../log-bus';
import { executeAction, isReceiptGrant } from './delivery-execute';
import type { DeliveryAction, DeliveryEntry, DeliveryQueueState, StateListener } from './delivery-queue.type';

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
// Stuck-delivery cap (~10s at 60fps): non-receipt actions log and complete on timeout;
// a confirmed receipt grant instead logs and keeps waiting (see the tick's timeout branch).
const DELIVERY_TIMEOUT_FRAMES = 600;
// A refused receipt grant retries on this pacing; every REFUSAL_WARN_EVERY-th refusal warns.
const REFUSAL_RETRY_COOLDOWN = 30;
const REFUSAL_WARN_EVERY = 10;

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
    // Complete only once the game actually consumed the item (busy → ready). Resolving
    // here, not at execute time, is what makes the simulator's trigger() wait for the
    // pickup + item-get dialog to fully finish.
    if (ready && deliveringBecameBusy) {
      const done = delivering;
      delivering = null;
      cooldownFrames = DELIVERY_COOLDOWN;
      notify();
      try { done.onComplete?.(); } catch { /* ignore */ }
      return;
    }
    if (deliveringFrames >= DELIVERY_TIMEOUT_FRAMES) {
      // A receipt grant only occupies this slot once the core returned status 1, so the
      // item IS granted. Never complete it on a timer (that is how a never-finishing
      // pickup used to be counted delivered); log and keep waiting for busy → ready.
      if (isReceiptGrant(delivering.action)) {
        log.app(`Delivery "${delivering.message}" still waiting for its pickup to finish, keeping it in flight`, 'warn');
        deliveringFrames = 0;
        return;
      }
      // Non-receipt actions keep the completing timeout so a stuck delivery can't hang a run.
      const done = delivering;
      delivering = null;
      cooldownFrames = DELIVERY_COOLDOWN;
      notify();
      log.app(`Delivery "${done.message}" timed out waiting for pickup to finish`, 'warn');
      try { done.onComplete?.(); } catch { /* ignore */ }
    }
    return;
  }

  if (queue.length === 0) return;
  if (!canReceive()) return;

  // Execute the front entry BEFORE dequeuing it: a refused receipt grant (status 0,
  // nothing granted) must stay at the front and re-enter the readiness wait, never
  // complete. Only a confirmed execution moves the entry into the in-flight slot, so
  // the grant call fires exactly once per actual grant.
  const entry = queue[0];
  if (executeAction(entry.action) === 'refused') {
    entry.refusals = (entry.refusals ?? 0) + 1;
    if (entry.refusals % REFUSAL_WARN_EVERY === 0) {
      log.app(`Delivery "${entry.message}" refused ${entry.refusals} times, retrying until the player can receive`, 'warn');
    }
    cooldownFrames = REFUSAL_RETRY_COOLDOWN;
    return;
  }
  queue.shift();
  delivering = entry;
  deliveringBecameBusy = false;
  deliveringFrames = 0;
  notify();
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
