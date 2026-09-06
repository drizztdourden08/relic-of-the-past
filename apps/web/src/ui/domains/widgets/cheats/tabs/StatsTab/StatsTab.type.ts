/* @layer renderer-widgets @kind types */
/**
 * One editable player property, described by its own bounds, formatting and write.
 * The controls render from this alone, so adding a property is a data change, never a UI change.
 */
type StatSpec = {
  id: string;
  label: string;
  /** Lowest legal engine value (a capacity floor for the "maximum" stats). */
  min: number;
  /** Highest legal engine value; tracks the live cap where the game grants upgrades. */
  max: number;
  step: number;
  /** Engine value rendered the way the player reads it: hearts, a percentage, a plain count. */
  format: (value: number) => string;
  /** Writes the value into the running game. */
  apply: (value: number) => void;
};

/** A titled band of related stats, where the current value and its capacity sit together. */
type StatGroup = {
  id: string;
  title: string;
  stats: StatSpec[];
};

export type { StatGroup, StatSpec };
