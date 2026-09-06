/* @layer shared-game @kind types */
/**
 * What the file assumes about an unlit room. The reference project asks this
 * as one three-way choice (Options.py DarkRoomLogic: lamp / torches / none),
 * which conflates two separate questions: must a room be lit at all, and
 * which items count as a light. This app asks them apart, because only the
 * second one is a matter of taste: a player who accepts feeling their way
 * through the dark wants that said once, not spelled into every item list.
 */

/** The four things a player can carry into an unlit room and still see by. */
type DarkRoomLightField = 'lamp' | 'fireRod' | 'bombos' | 'redCane';

/** Which of the four the file accepts; every false set means none of them. */
type DarkRoomLights = Readonly<Record<DarkRoomLightField, boolean>>;

interface DarkRoomSetting {
  /**
   * True: an unlit room counts as passable only while an accepted light is
   * carried. False: it counts as passable in the dark, so the seed may send
   * the player through one blind.
   */
  requireLight: boolean;
  /** The lights this file accepts. Accepting none reads as requiring none. */
  lights: DarkRoomLights;
}

export type { DarkRoomLightField, DarkRoomLights, DarkRoomSetting };
