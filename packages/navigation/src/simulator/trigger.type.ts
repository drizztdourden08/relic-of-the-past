/* @layer bridge-wasm @kind types */
import type { TriggerAction } from '../simulation';

type QueuedAction = Extract<TriggerAction, { type: 'chest' | 'npc' | 'overworld' | 'boss' }>;

export type { QueuedAction };
