/**
 * Delivery Queue — manages item deliveries that must wait until Link can receive them.
 * Polls WasmCanReceiveItem each frame; when ready, delivers the next item in FIFO order.
 * Fires callbacks so the UI can display pending/delivered state.
 */

import { getModule } from './wasm-bridge';

// ─── Types ───

interface DeliveryEntry {
  id: string;
  /** Human-readable message shown in the queue indicator */
  message: string;
  /** Source tag: 'cheat', 'randomizer', player name, etc. */
  source: string;
  /** The action to execute when Link can receive */
  action: DeliveryAction;
  /** Timestamp when enqueued */
  enqueuedAt: number;
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

// ─── Queue Implementation ───

let queue: DeliveryEntry[] = [];
let delivering: DeliveryEntry | null = null;
let rafId: number | null = null;
let listeners: Set<StateListener> = new Set();
let nextId = 0;
let cooldownFrames = 0;

const DELIVERY_COOLDOWN = 30; // frames between deliveries (~0.5s at 60fps)

function generateId(): string {
  return `dlv_${Date.now()}_${nextId++}`;
}

function getState(): DeliveryQueueState {
  return { pending: [...queue], delivering };
}

function notify(): void {
  const state = getState();
  for (const listener of listeners) {
    try { listener(state); } catch { /* ignore */ }
  }
}

function canReceive(): boolean {
  const mod = getModule();
  if (!mod) return false;
  return mod.ccall('WasmCanReceiveItem', 'number', [], []) === 1;
}

function executeAction(action: DeliveryAction): void {
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
}

function tick(): void {
  rafId = requestAnimationFrame(tick);

  if (cooldownFrames > 0) {
    cooldownFrames--;
    return;
  }

  if (delivering) {
    // Wait for the previous delivery to finish (Link becomes available again)
    if (canReceive()) {
      delivering = null;
      cooldownFrames = DELIVERY_COOLDOWN;
      notify();
    }
    return;
  }

  if (queue.length === 0) return;
  if (!canReceive()) return;

  // Deliver next item
  const entry = queue.shift()!;
  delivering = entry;
  notify();
  executeAction(entry.action);
}

// ─── Public API ───

function enqueue(
  message: string,
  source: string,
  action: DeliveryAction
): string {
  const entry: DeliveryEntry = {
    id: generateId(),
    message,
    source,
    action,
    enqueuedAt: Date.now(),
  };
  queue.push(entry);
  notify();
  return entry.id;
}

function remove(id: string): boolean {
  const idx = queue.findIndex((e) => e.id === id);
  if (idx === -1) return false;
  queue.splice(idx, 1);
  notify();
  return true;
}

function clear(): void {
  queue = [];
  delivering = null;
  cooldownFrames = 0;
  notify();
}

function peek(): DeliveryEntry | undefined {
  return queue[0];
}

function size(): number {
  return queue.length;
}

function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function startProcessing(): void {
  if (rafId != null) return;
  rafId = requestAnimationFrame(tick);
}

function stopProcessing(): void {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

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
export type { DeliveryEntry, DeliveryAction, DeliveryQueueState };
