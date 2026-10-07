/* @layer shared-game @kind logic */
/**
 * The order the id tables were first numbered in: natural key order, so rung 10 sorts after
 * rung 9 and `item-100` after `item-099`. It only decides where a NEW key lands when a table
 * is extended; an id already handed out never moves.
 */

const compareApKeys = (left: string, right: string): number =>
  left.localeCompare(right, 'en', { numeric: true });

export { compareApKeys };
