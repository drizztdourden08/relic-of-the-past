/* @layer bridge-wasm @kind logic */
const sramSyncState = {
  interval: null as ReturnType<typeof setInterval> | null,
  lastHash: null as string | null,
};

export { sramSyncState };
