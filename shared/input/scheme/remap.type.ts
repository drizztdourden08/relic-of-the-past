/* @layer shared-input @kind types */
/**
 * The one shape every remap strategy answers with, kept in its own file so
 * the strategies and the selector can share it without importing each other.
 */

/** The two schemes a profile can be played under. Mirrors the settings
 *  field of the same name; declared here so the scheme layer never has to
 *  reach into the settings type to know what it is remapping for. */
type ControlSchemeId = 'classic' | 'modern';

interface RemapResult {
  /** The SNES bitmask to hand the core this frame. */
  mask: number;
  /** New-style hud item id (1..24) the host should make active, or 0 for
   *  "leave the core's own equipped item alone". */
  activeItem: number;
}

export type { ControlSchemeId, RemapResult };
