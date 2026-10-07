/* @layer renderer-lib @kind logic */
/**
 * Does the live save hold this item? That is the one question the per-frame remap cannot answer.
 *
 * The scheme layer is pure and carries no inventory, so `remapModern` used to write the
 * core's single equipped-item register from an assignment alone. Assignments are stored per
 * PROFILE and not per save file, so a fresh file inherits buttons pointing at items it has
 * never found, and pressing one parked the register on an id that save has no item for while
 * the pause menu, two feet away, was refusing to assign that very cell. Two surfaces, two
 * answers, one save.
 *
 * This is the one answer. It is `buildItemCells`' own `owned` flag, from the same function the
 * pause grid and `planAssignment` are built on, so the gameplay press and the menu refusal
 * cannot drift apart. Reproducing the ownership arithmetic here (bombs, the split
 * tool/instrument slot, the four bottles) is exactly how they drifted in the first place.
 *
 * WHY IT LIVES IN THE INPUT LAYER, not in the scheme layer or in a store: the router is the
 * only place that holds both halves (the pressed slot and the live game state), and it must
 * not go asking a store per frame. It does not. The UI store publishes a new `inventory` on
 * every changed frame (the player's own coordinates change most of them), so identity is
 * useless as a memo key; the twenty-four bytes themselves are the key instead, compared
 * without allocating, and the cells are rebuilt only when the save's inventory really moved.
 */
import { buildItemCells } from '@shared/game/logic/pause';
import { useGameUIStore } from '@app/stores/game-ui-store';

let lastItems: readonly number[] = [];
let lastBottles: readonly number[] = [];
let owned: readonly boolean[] = [];

const sameNumbers = (a: readonly number[], b: readonly number[]): boolean =>
  a.length === b.length && a.every((value, i) => value === b[i]);

/** The 24 cells' `owned` flags, rebuilt only when the inventory bytes actually changed. */
const ownedHudItems = (): readonly boolean[] => {
  const { items, bottles } = useGameUIStore.getState().inventory;
  if (sameNumbers(items, lastItems) && sameNumbers(bottles, lastBottles)) return owned;
  lastItems = [...items];
  lastBottles = [...bottles];
  owned = buildItemCells(items, bottles).map(cell => cell.owned);
  return owned;
};

/** `OwnsItem` for the modern remap: is new-style hud item `hudItem` (1..24) in this save? */
const ownsHudItem = (hudItem: number): boolean => ownedHudItems()[hudItem - 1] === true;

export { ownedHudItems, ownsHudItem };
