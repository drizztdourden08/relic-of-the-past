/* @layer electron-main @kind logic */
/**
 * Every popped window and what ties them together, in one place: the pin mode
 * of each, whether it snaps, and the window it is held against. The windows
 * never talk to each other; this registry moves a linked group along with its
 * anchor, mirrors the app's own pin onto the windows that follow it, and tells
 * the main window whenever a persisted fact changes.
 */
import type { BrowserWindow } from 'electron';
import type { PinMode, PoppedWidget, PoppedWindowState, SnapLink, WindowBounds } from '@shared/types/widget-layout';
import { emit } from '../lib/ipc/handle';
import { getMainWindow } from '../window/create-window';
import { shifted, snapTo } from './popout-snap';
import type { SnapTarget } from './popout-snap';

interface Entry {
  win: BrowserWindow;
  pin: PinMode;
  snap: boolean;
  link: SnapLink | null;
  /** The bounds last seen, so a move turns into a delta for the windows linked to it. */
  last: WindowBounds;
  /** Set while this registry moves the window itself, so its own handlers stay quiet. */
  towed: boolean;
}

const entries = new Map<string, Entry>();
let mainLast: WindowBounds | null = null;
let mainAttached = false;

const alive = (win: BrowserWindow): boolean => !win.isDestroyed();

const boundsOf = (win: BrowserWindow): WindowBounds => {
  const { x, y, width, height } = win.getBounds();
  return { x, y, width, height };
};

const stateOf = (entry: Entry): PoppedWindowState =>
  ({ pin: entry.pin, onTop: entry.win.isAlwaysOnTop(), snap: entry.snap, link: entry.link });

const tellMain = (id: string, patch: Partial<PoppedWidget>): void => {
  const main = getMainWindow();
  if (main) emit(main, 'widget:popped', id, patch);
};

const tellWindow = (entry: Entry): void => emit(entry.win, 'widget:windowState', stateOf(entry));

/** The pin as one table: what each mode means given whether the app itself is on top. */
const applyPin = (entry: Entry, mainOnTop: boolean): void => {
  const onTop = { off: false, top: true, 'with-app': mainOnTop }[entry.pin];
  entry.win.setAlwaysOnTop(onTop, 'floating');
  tellWindow(entry);
};

const mainOnTop = (): boolean => getMainWindow()?.isAlwaysOnTop() ?? false;

/** Moves every window linked to `anchor` by the same delta, and whatever is linked to those. */
const towLinked = (anchor: 'main' | string, dx: number, dy: number, seen = new Set<string>()): void => {
  if (dx === 0 && dy === 0) return;
  for (const [id, entry] of entries) {
    if (entry.link?.to !== anchor || seen.has(id) || !alive(entry.win)) continue;
    seen.add(id);
    entry.towed = true;
    entry.last = shifted(entry.last, dx, dy);
    entry.win.setBounds(entry.last);
    entry.towed = false;
    towLinked(id, dx, dy, seen);
  }
};

const attachMain = (): void => {
  const main = getMainWindow();
  if (mainAttached || !main) return;
  mainAttached = true;
  mainLast = boundsOf(main);
  main.on('move', () => {
    const now = boundsOf(main);
    if (mainLast) towLinked('main', now.x - mainLast.x, now.y - mainLast.y);
    mainLast = now;
  });
  // The app comes forward: the windows that follow it come along.
  main.on('focus', () => {
    for (const entry of entries.values()) if (entry.pin === 'with-app' && alive(entry.win)) entry.win.moveTop();
  });
};

/** What the dragged window may snap against: the app and every other popped window. */
const targetsFor = (id: string): SnapTarget[] => {
  const out: SnapTarget[] = [];
  const main = getMainWindow();
  if (main && !main.isMinimized()) out.push({ to: 'main', bounds: boundsOf(main) });
  for (const [other, entry] of entries) if (other !== id && alive(entry.win)) out.push({ to: other, bounds: entry.last });
  return out;
};

/** The dragged window asked to go to `wanted`: snapped bounds when something is near, else null. */
const snapWanted = (id: string, wanted: WindowBounds): WindowBounds | null => {
  const entry = entries.get(id);
  if (!entry || entry.towed || !entry.snap) return null;
  const hit = snapTo(wanted, targetsFor(id));
  const link = hit?.link ?? null;
  if (JSON.stringify(link) !== JSON.stringify(entry.link)) {
    entry.link = link;
    tellMain(id, { link });
    tellWindow(entry);
  }
  return hit?.bounds ?? null;
};

/** The window settled somewhere: remember it, and tow what hangs off it. */
const settled = (id: string): void => {
  const entry = entries.get(id);
  if (!entry || !alive(entry.win)) return;
  const now = boundsOf(entry.win);
  if (!entry.towed) towLinked(id, now.x - entry.last.x, now.y - entry.last.y);
  entry.last = now;
};

const register = (id: string, win: BrowserWindow, popped: Omit<PoppedWidget, 'id'> | undefined): Entry => {
  attachMain();
  const entry: Entry = { win, pin: popped?.pin ?? 'off', snap: popped?.snap ?? true, link: null, last: boundsOf(win), towed: false };
  entries.set(id, entry);
  applyPin(entry, mainOnTop());
  return entry;
};

const unregister = (id: string): void => {
  entries.delete(id);
  for (const entry of entries.values()) if (entry.link?.to === id) entry.link = null;
};

const setPin = (id: string, mode: PinMode): PinMode => {
  const entry = entries.get(id);
  if (!entry || !alive(entry.win)) return 'off';
  entry.pin = mode;
  applyPin(entry, mainOnTop());
  tellMain(id, { pin: mode });
  return mode;
};

const setSnap = (id: string, on: boolean): void => {
  const entry = entries.get(id);
  if (!entry) return;
  entry.snap = on;
  if (!on && entry.link) { entry.link = null; tellMain(id, { link: null }); }
  tellMain(id, { snap: on });
  tellWindow(entry);
};

/** The app's own pin changed: every window that follows it re-applies. */
const mirrorMainPin = (mainIsOnTop: boolean): void => {
  for (const entry of entries.values()) if (entry.pin === 'with-app' && alive(entry.win)) applyPin(entry, mainIsOnTop);
};

const windowState = (id: string): PoppedWindowState | null => {
  const entry = entries.get(id);
  return entry && alive(entry.win) ? stateOf(entry) : null;
};

const windowOf = (id: string): BrowserWindow | null => {
  const entry = entries.get(id);
  return entry && alive(entry.win) ? entry.win : null;
};

const openIds = (): string[] => [...entries.keys()].filter((id) => windowOf(id) !== null);

const windows = (): BrowserWindow[] => [...entries.values()].map((e) => e.win).filter(alive);

export {
  mirrorMainPin, openIds, register, setPin, setSnap, settled, snapWanted, unregister, windowOf, windowState, windows,
};
