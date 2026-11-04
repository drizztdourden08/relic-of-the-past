/* @layer bridge-wasm @kind logic */
import type { MsuSession } from '@rotp/msu';
import type { AlttpMusicContext } from '@rotp/msu';

const cueOf = (ctrl: number, scene: number, entrance: number, overworldArea: number) =>
  ({ ctrl, scene, context: { entrance, overworldArea } satisfies AlttpMusicContext });

const attachHooks = (session: MsuSession): void => {
  window.__onMusicCtrl = (ctrl, module, entrance, overworldArea) =>
    session.onMusicCue(cueOf(ctrl, module, entrance, overworldArea));
  window.__onGameSound = session.onGameSound;
  window.__msuIsPlaying = (ctrl, module, entrance, overworldArea) =>
    session.isPlaying(cueOf(ctrl, module, entrance, overworldArea));
};

export { attachHooks };
