/* @layer renderer-stores @kind logic */
/**
 * The active control scheme, the resolved modern bindings, and what each slot fires.
 *
 * Two halves that are deliberately not the same thing. The BINDINGS say where a slot
 * physically sits and come from the input profile; the ASSIGNMENTS say what it does and come
 * from the profile's settings. Re-binding never disturbs an assignment and assigning never
 * disturbs a binding, which is only possible because assignments are keyed by the slot
 * NUMBER (contract §19), not by the button the slot happens to read. Rebinding
 * slot 3 from B to X changes what slot 3 IS; the item on it does not move, and neither
 * does its place in the HUD layout, which references the same number.
 *
 * `setAssignment` writes nothing to the core. That is not an omission: the equipped-item
 * register is written per frame by the input router, on the frame the slot is actually
 * pressed, so an assignment made in the pause menu changes what a later press will do and
 * nothing about what is equipped right now.
 */
import { create } from 'zustand';
import type { GameSettings } from '@shared/types/settings';
import { migrateScheme } from '@shared/input/scheme';
import { controlSchemeOf, hostDrawnHud } from '@shared/features/hud-style';
import type { ControlSchemeId } from '@shared/input/scheme';
import type { ModernBindings, SlotAssignment, SlotIndex } from '@shared/types/controls';
import { liveSettingsNow } from '@app/lib/game/live-settings';
import { getProfileId } from '@app/lib/game/wasm-bridge';
import { setTakeover } from '@app/lib/game/host-menu';
import { onSchemeBindings, setControlScheme, setSchemeAssignments } from '@app/lib/input/scheme-runtime';
import { readConfig, writeConfig } from '@app/lib/storage/profile-store';
import { useGameUIStore } from './game-ui-store';
import { useSpriteAvailabilityStore } from './sprite-availability-store';

type Assignments = Record<SlotIndex, SlotAssignment>;

interface ControlSchemeStore {
  scheme: ControlSchemeId;
  /** null under classic, because the modern lens on the profile is not resolved there. */
  bindings: ModernBindings | null;
  assignments: Assignments;
  setAssignment: (slot: SlotIndex, assignment: SlotAssignment) => void;
  clearAssignment: (slot: SlotIndex) => void;
  _sync: (next: Partial<ControlSchemeStore>) => void;
}

let writeQueue: Promise<void> = Promise.resolve();

/** The settings object last pushed downstream. See `refreshControlSettings`. */
let lastApplied: GameSettings | null = null;

/**
 * Merge-write the assignment table into the profile's own settings file, through the same
 * readConfig/writeConfig seam every other setting uses. Serialized, because two assignments
 * made in quick succession would otherwise each read the pre-change config and the second
 * would drop the first.
 */
const persist = (assignments: Assignments): void => {
  const id = getProfileId();
  if (!id) return;
  writeQueue = writeQueue
    .then(async () => {
      const config = (await readConfig(id)) ?? {};
      await writeConfig(id, { ...config, modernScheme: { assignments } });
    })
    .catch((e: unknown) => console.error('[controls] failed to persist slot assignments', e));
};

/** Push a new table to the store, the per-frame runtime and the profile, in that order. */
const commit = (set: (patch: Partial<ControlSchemeStore>) => void, assignments: Assignments): void => {
  set({ assignments });
  setSchemeAssignments({ assignments });
  persist(assignments);
};

const useControlSchemeStore = create<ControlSchemeStore>()((set, get) => ({
  scheme: 'classic',
  bindings: null,
  assignments: {},
  setAssignment: (slot, assignment) => commit(set, { ...get().assignments, [slot]: assignment }),
  clearAssignment: (slot) => {
    const { [slot]: _dropped, ...rest } = get().assignments;
    commit(set, rest);
  },
  _sync: (next) => set(next),
}));

/**
 * Will `EnhancedPauseView` actually be on screen?
 *
 * This mirrors GameOverlay's own render condition term for term, and it has to: the takeover
 * PARKS the native pause menu (no input handling, no cursor, no redraw), so arming it while
 * nothing is drawn on top hands the player a blank, frozen screen. Both host-drawn styles
 * (Enhanced and Modern) render it; the Original style does not, and there the native menu is
 * left to draw and close itself.
 */
const enhancedPauseDrawn = (settings: GameSettings): boolean =>
  hostDrawnHud(settings.hudStyle)
  && settings.hudMode === 'enhanced'
  && settings.hudEnhancedParts.includes('pause')
  && useSpriteAvailabilityStore.getState().available;

/**
 * Settings' assignment table, keyed by slot NUMBER.
 *
 * A table written before contract §19 is keyed by position-derived ids
 * (`slot:NORTH`), and turning those into numbers needs the slot LIST, which
 * lives on the input profile, not in settings. So the fast path is checked
 * first: a table that is already all numbers needs no list and no work, which
 * is every table after the first save. Only an old one waits for bindings, and
 * it is re-read the moment they arrive (see `syncControlBindings`).
 *
 * `migrateScheme` throws on a key it cannot read instead of dropping it, so a
 * table that cannot be migrated is loud instead of silently shorter.
 */
const migratedAssignments = (settings: GameSettings): Assignments => {
  const stored = settings.modernScheme?.assignments ?? {};
  const keys = Object.keys(stored);
  if (keys.every((key) => Number.isInteger(Number(key)))) return stored;
  const slots = useControlSchemeStore.getState().bindings?.slots;
  if (!slots || slots.length === 0) return stored;   // no list yet; re-read on arrival
  return migrateScheme(slots, stored).assignments;
};

/**
 * Settings → everything downstream, in one call: the store, the per-frame runtime, and the
 * core's standing takeover request.
 *
 * Vanilla Safe strips the gates in the core, so the request is dropped here too instead of
 * left standing against a gate that will refuse it.
 */
const syncControlSettings = (settings: GameSettings): void => {
  const scheme = controlSchemeOf(settings);
  const assignments = migratedAssignments(settings);
  useControlSchemeStore.getState()._sync({ scheme, assignments });
  setControlScheme(scheme, settings.mapOnSelect === true);
  setSchemeAssignments({ assignments });
  setTakeover(!settings.vanillaSafe && enhancedPauseDrawn(settings));
};


/**
 * Pull the settings the live-settings layer last pushed, if they are not the ones already
 * applied. Identity is enough to compare: that layer replaces the whole object on every push
 * and never mutates it in place.
 *
 * Pulling instead of waiting to be pushed is deliberate. The settings screen notifies the
 * input engine about the two fields it knows are input's business, but the takeover also
 * depends on the HUD style and on Vanilla Safe, which are settings that belong to other screens
 * entirely. Reading the whole object here means no caller has to remember the full list.
 */
const refreshControlSettings = (): void => {
  const settings = liveSettingsNow();
  if (!settings || settings === lastApplied) return;
  lastApplied = settings;
  syncControlSettings(settings);
};

// The UI store publishes only on a changed frame, and the check above is an identity compare,
// so this is a pointer comparison per change and a real sync only when the settings move.
useGameUIStore.subscribe(refreshControlSettings);


// Sprite availability is the one term of the takeover condition that is NOT a setting. It
// follows the active ROM's extracted art and can flip long after the settings last moved. The
// identity guard above would swallow that, so the memo is dropped before re-applying.
useSpriteAvailabilityStore.subscribe(() => {
  lastApplied = null;
  refreshControlSettings();
});

/** Input profile → store. The bindings half, which settings knows nothing about. */
const syncControlBindings = (bindings: ModernBindings | null): void => {
  if (useControlSchemeStore.getState().bindings === bindings) return;
  useControlSchemeStore.getState()._sync({ bindings });
  // Bindings are the slot list an old assignment table needs to be migrated
  // against, so their arrival is a reason to re-read settings even though the
  // settings themselves did not move.
  lastApplied = null;
  refreshControlSettings();
};

// The input engine is the only thing that knows which profile is active and what the device
// actually reports, and it already resolves the modern lens on every profile change and every
// device snapshot (`rebuildSchemeBindings`). Subscribing to that resolution, instead of
// reading `profile.modern` at three separate call sites, is what keeps the cluster, the
// per-frame router and the pause menu looking at one object. Fires immediately, so a late
// import of this module still gets the bindings the engine resolved at boot.
onSchemeBindings(syncControlBindings);

export { refreshControlSettings, syncControlBindings, syncControlSettings, useControlSchemeStore };
export type { ControlSchemeStore };
