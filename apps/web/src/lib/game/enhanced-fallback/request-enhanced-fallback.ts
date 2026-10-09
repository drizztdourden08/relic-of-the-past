/* @layer bridge-wasm @kind logic */
import { ENHANCED_FALLBACK_EVENT } from './enhanced-fallback.constants';

const requestEnhancedFallback = (): void => {
  window.dispatchEvent(new Event(ENHANCED_FALLBACK_EVENT));
};

export { requestEnhancedFallback };
