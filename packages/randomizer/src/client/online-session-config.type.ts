/* @layer bridge-wasm @kind types */
interface OnlineSessionConfig {
  url: string;
  fallbackUrl?: string;
  slotName: string;
  game?: string;
  password?: string;
  deathLink?: boolean;
  trackOtherPlayers?: boolean;
}

export type { OnlineSessionConfig };
