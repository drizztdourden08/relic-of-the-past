/* @layer bridge-wasm @kind logic */
import {
  announceCoreMusic, getMasterAudioTarget, renderOriginalSound, restoreCoreMusic, setDeluxeEntrances,
  setExternalAmbient, setExternalMusic, setExternalSfx, setSoundTrace, subscribeGameState, voidCall,
} from '@rotp/game-core';
import type { PreviewTarget } from '@rotp/game-core';
import { ALTTP_DELUXE_VARIANT } from '@rotp/msu';
import type { MsuHost } from '@rotp/msu';

const msuHost: MsuHost = {
  audioTarget: getMasterAudioTarget,
  setExternalMusic,
  restoreCoreMusic,
  announceCoreMusic,
  setVariant: (name) => setDeluxeEntrances(name === ALTTP_DELUXE_VARIANT),
  setExternalSounds: (bus, on) => (bus === 'ambient' ? setExternalAmbient(on) : setExternalSfx(on)),
  setSoundClaim: (coreIndex, low, high) => {
    voidCall('WasmSetSoundClaim', { argTypes: ['number', 'number', 'number'], args: [coreIndex, low, high] });
  },
  setSoundTrace,
  onCoreRunning: (cb) => subscribeGameState((state) => {
    if (state.status === 'running') cb();
  }),
  renderOriginalSound: (target, id, seconds) => renderOriginalSound(target as PreviewTarget, id, seconds),
};

export { msuHost };
