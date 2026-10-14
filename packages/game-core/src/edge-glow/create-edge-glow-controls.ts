/* @layer bridge-wasm @kind logic */
import type { EdgeGlowState } from './edge-glow-programs.type';

const createEdgeGlowControls = (state: EdgeGlowState) => ({
  setEnabled: (val: boolean): void => { state.enabled = val; },
  setBlackBounds: (left: number, right: number, bottom: number, top: number): void => {
    state.black = { left, right, bottom, top };
  },
  setMaxBounds: (left: number, right: number, bottom: number, top: number): void => {
    state.max = { left, right, bottom, top };
  },
  setEffectOpacity: (opacity: number): void => { state.effectOpacity = opacity; },
  setPixelateParams: (size: number, divisor: number, exponent: number): void => {
    state.pixelSizeMultiplier = size;
    state.pixelDivisor = divisor;
    state.pixelExponent = exponent;
  },
});

export { createEdgeGlowControls };
