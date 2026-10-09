/* @layer renderer-app @kind types */
interface SaveOverlayState {
  shown: boolean;
  toggle: () => void;
  hide: () => void;
}

export type { SaveOverlayState };
