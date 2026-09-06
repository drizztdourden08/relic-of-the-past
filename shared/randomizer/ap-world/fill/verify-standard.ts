/* @layer shared-game @kind logic */
/**
 * Standard-mode structural checks on a finished placement. The reference
 * guarantees these by construction (ItemPool.py generate_itempool 294-318),
 * so a stored placement violating them was generated under different rules
 * and is unplayable: the escape must be fought with whatever the mentor
 * check grants, before any other check is reachable, and the in-game start
 * carries no bombs, because the reachability sweep's ammo assumptions hold only
 * once that check yields a member of the assurance set, one the capacity
 * profile, when given, leaves usable at the start (uncle-usability.ts).
 * Returns problems; an empty list means the placement honors the
 * standard-mode guarantee.
 */
import { UNCLE_LOCATION, UNCLE_USABLE_WEAPONS } from '../pool/standard-escape.data';
import { uncleWeaponUsableAtStart } from '../pool/uncle-usability';
import type { CapacityProfile } from '../capacity/capacity-profile.type';

const verifyStandardEscape = (
  nameView: Readonly<Record<string, string>>, capacity?: CapacityProfile, retroBow = false,
): string[] => {
  const placed = nameView[UNCLE_LOCATION];
  if (placed === undefined) {
    return [`standard mode requires a placement at ${UNCLE_LOCATION}, found none`];
  }
  if (!UNCLE_USABLE_WEAPONS.has(placed)) {
    return [`standard mode requires a usable weapon at ${UNCLE_LOCATION}, found: ${placed}`];
  }
  if (capacity !== undefined && !uncleWeaponUsableAtStart(capacity, retroBow)(placed)) {
    return [`standard mode requires a weapon usable at the starting rungs at ${UNCLE_LOCATION}, found: ${placed}`];
  }
  return [];
};

export { verifyStandardEscape };
