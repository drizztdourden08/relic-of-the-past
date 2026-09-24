/* @layer bridge-wasm @kind logic */
/**
 * The main window's side of the relay: every change a widget reads goes out as
 * a slice, and a pop-out that just opened gets the whole picture on request.
 * The settings, the profile and the game state are pushed in by the app shell,
 * which owns them; the tracker sets and the log come straight from their buses.
 */
import type { GameSettings } from '@shared/types/settings';
import { getEntries, subscribe as subscribeLog } from '../../log-bus';
import { getCompletedChecks, getCurrentInventory, onCompletedChecksChanged, onInventoryChanged } from '../tracker';
import type { RelaySlice } from './relay-slices';

let settings: GameSettings | null = null;
let profileId: string | null = null;
let running = false;
let installed: (() => void) | null = null;

const publish = (slice: RelaySlice): void => {
  window.api.publishWidgetSlice(slice);
};

const publishSnapshot = (): void => {
  publish({ kind: 'profile', data: { profileId } });
  if (settings) publish({ kind: 'settings', data: settings });
  publish({ kind: 'game', data: { running } });
  publish({ kind: 'inventory', data: [...getCurrentInventory()] });
  publish({ kind: 'completedChecks', data: [...getCompletedChecks()] });
  publish({ kind: 'logs', data: getEntries() });
};

const publishSettings = (next: GameSettings): void => {
  settings = next;
  publish({ kind: 'settings', data: next });
};

const publishProfile = (next: string | null): void => {
  profileId = next;
  publish({ kind: 'profile', data: { profileId: next } });
};

const publishGameRunning = (next: boolean): void => {
  running = next;
  publish({ kind: 'game', data: { running: next } });
};

/** Starts forwarding; returns the stop. Safe to call once per app shell. */
const installWidgetPublisher = (): (() => void) => {
  if (installed) return installed;
  const offInventory = onInventoryChanged((items) => publish({ kind: 'inventory', data: [...items] }));
  const offChecks = onCompletedChecksChanged((checks) => publish({ kind: 'completedChecks', data: [...checks] }));
  const offLog = subscribeLog((entry) => publish({ kind: 'log', data: entry }));
  const offRequest = window.api.onWidgetSnapshotRequest(() => publishSnapshot());
  installed = () => {
    offInventory();
    offChecks();
    offLog();
    offRequest();
    installed = null;
  };
  return installed;
};

export { installWidgetPublisher, publishGameRunning, publishProfile, publishSettings };
