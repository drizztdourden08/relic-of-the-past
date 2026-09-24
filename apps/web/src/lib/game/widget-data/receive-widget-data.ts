/* @layer bridge-wasm @kind logic */
/**
 * A pop-out's side of the relay: slices from the main window feed the same
 * buses the widgets read in the main window (the tracker sets, the log), and
 * the shell-owned pieces (settings, profile, game state) are kept here for the
 * host view to subscribe to. Asks for a full snapshot as soon as it is installed.
 */
import type { GameSettings } from '@shared/types/settings';
import { ingest } from '../../log-bus';
import { applyRelayedCompletedChecks, applyRelayedInventory } from '../tracker';
import type { RelaySlice } from './relay-slices';

interface HostState {
  settings: GameSettings | null;
  profileId: string | null;
  running: boolean;
}

type HostListener = (state: HostState) => void;

let state: HostState = { settings: null, profileId: null, running: false };
const listeners = new Set<HostListener>();

const setState = (patch: Partial<HostState>): void => {
  state = { ...state, ...patch };
  for (const fn of listeners) {
    try { fn(state); } catch { /* a bad listener never breaks the relay */ }
  }
};

const applySlice = (slice: RelaySlice): void => {
  switch (slice.kind) {
    case 'inventory': applyRelayedInventory(slice.data); break;
    case 'completedChecks': applyRelayedCompletedChecks(slice.data); break;
    case 'log': ingest(slice.data); break;
    case 'logs': slice.data.forEach(ingest); break;
    case 'settings': setState({ settings: slice.data }); break;
    case 'profile': setState({ profileId: slice.data.profileId }); break;
    case 'game': setState({ running: slice.data.running }); break;
  }
};

const getHostState = (): HostState => state;

const onHostState = (fn: HostListener): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

/** Starts receiving for that widget and asks for the snapshot; returns the stop. */
const installWidgetReceiver = (widgetId: string): (() => void) => {
  const off = window.api.onWidgetRelay((slice) => applySlice(slice as RelaySlice));
  window.api.subscribeWidgetRelay(widgetId);
  return off;
};

export { getHostState, installWidgetReceiver, onHostState };
export type { HostState };
