/* @layer renderer-lib @kind logic */
const hapticState = {
  initialized: false,
  profileEnabled: true,
  activeUntil: 0,
  activeIntensity: 0,
  decayTimer: null as ReturnType<typeof setTimeout> | null,
  debugLogTimer: null as ReturnType<typeof setInterval> | null,
  counts: { events: 0, dispatched: 0, merged: 0, coreHooks: 0 },
};

export { hapticState };
