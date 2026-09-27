/* @layer bridge-wasm @kind types */
/**
 * What an online session is started with: the room and the slot. Everything the game is set
 * up with comes from the room itself (the slot data and the scouts), as a local seed's comes
 * from its placement.
 */

interface OnlineSessionConfig {
  /** As typed: a bare host:port tries wss:// first and ws:// when that never opens. */
  url: string;
  slotName: string;
  /** Server-side game key; defaults to this app's own registered name. */
  game?: string;
  /** The room password; absent or empty for an open room. */
  password?: string;
  /** Joins the room's DeathLink: a death here kills the others, and theirs kill Link. */
  deathLink?: boolean;
  /** One tracker connection per other player, for their checks count (tracker-links.ts). On unless false. */
  trackOtherPlayers?: boolean;
}

export type { OnlineSessionConfig };
