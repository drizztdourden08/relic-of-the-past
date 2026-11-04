/* @layer bridge-wasm @kind logic */
const detachHooks = (): void => {
  window.__onMusicCtrl = undefined;
  window.__onGameSound = undefined;
  window.__msuIsPlaying = undefined;
};

export { detachHooks };
