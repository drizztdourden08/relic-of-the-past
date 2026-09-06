/* @layer shared-game @kind types */
/**
 * The pair the capacity families and the wishing pond form. They share the
 * same physical slots, so neither can be read on its own: the selection is
 * what the player asked for, the reconciliation is what the seed will
 * actually be built from, and the notes are the plain sentences saying why
 * the two differ. The retro switch rides along because it takes one of the
 * pond-fed families out of the pair altogether.
 */
import type { CapacityFamilyId, CapacityProfile } from '../capacity/capacity-profile.type';
import type { PondMode, PondSetting } from '../pond/pond-profile.type';

/** What the player asked for: the master switch, the four families, the pond, the retro switch. */
interface CapacityPondSelection {
  /** The master switch. Off means the whole feature is out: every family vanilla, the pond native. */
  enabled: boolean;
  capacity: CapacityProfile;
  pond: PondSetting;
  /**
   * Retro bow. On, every shot is paid for in rupees, so the projectiles family
   * has nothing to upgrade: it is read as Vanilla whatever was stored, and the
   * pond stops counting it as one of the families it feeds.
   */
  retroBow: boolean;
}

/**
 * The control the player just moved, which is the one that keeps its value
 * when the two sides disagree:
 *
 *   'pond'      — the mode dropdown moved, so the families follow it.
 *   a family id — that row's mode moved, so the pond follows IT and the other
 *                 pond-fed family falls in behind. Naming the row matters: a
 *                 family leaving the pool has to be able to pull the pond back
 *                 to its legacy mode, which reading the profile as a whole
 *                 could never tell apart from the family that stayed.
 *   'capacity'  — the profile changed wholesale (a reset), so the pond follows
 *                 the profile: legacy unless BOTH pond-fed families are pooled.
 */
type CapacityPondAuthority = 'pond' | 'capacity' | CapacityFamilyId;

interface ReconciledCapacityPond extends CapacityPondSelection {
  /** One plain sentence per rule that is binding on this pair; [] when nothing is forced. */
  notes: readonly string[];
  /** False while the master switch is off: the capacity tab renders greyed and frozen. */
  capacityEditable: boolean;
  /** False while the master switch is off: the pond's mode row and controls are frozen. */
  pondEditable: boolean;
  /** The pond modes the dropdown may offer for this pair. */
  pondModes: readonly PondMode[];
  /**
   * The families a sibling setting has taken out of the player's hands, each
   * with the sentence its card shows in red. The stored setting is kept
   * underneath; the reconciled profile carries the masked reading.
   */
  forcedFamilies: ReadonlyMap<CapacityFamilyId, string>;
}

export type { CapacityPondAuthority, CapacityPondSelection, ReconciledCapacityPond };
