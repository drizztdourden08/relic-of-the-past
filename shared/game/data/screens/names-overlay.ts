/* @layer shared-game @kind logic */
/**
 * Display-name overlay for screens, supplied by the private vault.
 *
 * The screen datasets in this repository carry the STRUCTURE — ids, room and
 * palace indices, connections, tags — which is this project's own mapping work.
 * The human-readable names are transcribed from the original game, so they live in
 * the private companion repo and are synced to `.names.json` (gitignored) by
 * `scripts/vault/sync.mjs`.
 *
 * Without the vault the overlay is simply absent and a screen shows its id
 * (`hc-0x80`). That is the whole degradation: less readable, fully functional. No
 * caller needs to know which case it is in.
 */

/** `screen id → display name`, as the vault ships it. */
type NameOverlay = Readonly<Record<string, string>>;

let overlay: NameOverlay = {};

/**
 * Install the overlay. Called once at startup with the parsed `.names.json`, or
 * not at all when the file is absent.
 */
const setNameOverlay = (names: NameOverlay): void => {
  overlay = names;
};

/** True when names are available — useful for a one-line startup notice. */
const hasNameOverlay = (): boolean => Object.keys(overlay).length > 0;

/**
 * The name to show for a screen. Falls back to the structural name the dataset
 * carries, then to the id itself, so this never returns empty.
 */
const displayName = (id: string, fallback?: string): string => overlay[id] ?? fallback ?? id;

export { setNameOverlay, hasNameOverlay, displayName };
export type { NameOverlay };
