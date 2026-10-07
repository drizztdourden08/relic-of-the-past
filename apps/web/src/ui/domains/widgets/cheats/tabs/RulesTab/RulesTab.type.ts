/* @layer renderer-widgets @kind types */
/**
 * The three kinds of tile the Rules tab draws. Every tile is a row of a table: what it
 * shows (a HUD sprite and its names), which gate category it answers to, and how it
 * reads and writes the core. The tab renders the tables and knows nothing else.
 */
import type { CheatCategory } from '@app/lib/game';

type TileSpec = {
  id: string;
  /** The full sentence: the tooltip and the accessible name. */
  label: string;
  /** Two words at most, drawn uppercase under the art. */
  name: string;
  /** The HUD sprite filename, without extension. */
  sprite: string;
  category: CheatCategory;
};

/** A state: on or off, a tick box under the art. */
type RuleTileSpec = TileSpec & {
  read: () => boolean;
  write: (on: boolean) => void;
};

type Rung = {
  value: number;
  label: string;
};

/** A ladder: one rung at a time, the first rung being the game's own value. */
type RungTileSpec = TileSpec & {
  rungs: Rung[];
  read: () => number;
  write: (value: number) => void;
};

/** A one-shot: pressing it runs the action once and holds nothing. */
type ActionTileSpec = TileSpec & {
  run: () => void;
};

/** The face a tile wears: lit, dimmed, or inert because its category is off. */
type TileState = 'on' | 'off' | 'disabled';

export type { ActionTileSpec, Rung, RuleTileSpec, RungTileSpec, TileSpec, TileState };
