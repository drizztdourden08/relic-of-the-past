/* @layer bridge-wasm @kind types */
interface LinkDeath {
  byRoom: boolean;
  text: string;
}

type LinkDiedListener = (death: LinkDeath) => void;

declare global {
  interface Window { __onLinkDied?: ((cause?: unknown) => void) | null }
}

export type { LinkDeath, LinkDiedListener };
