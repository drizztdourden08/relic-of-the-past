/* @layer shared-types @kind types */
/**
 * `Value` is what every bindable number in the HUD document becomes: a plain
 * literal, which is the common case and stays a bare number in JSON, or an
 * expression read from the live variable table (`shared/hud/data/variables.ts`)
 * through `shared/hud/data/resolve-value.ts`.
 *
 * `Paint` ships alongside it instead of in its own file because the styling
 * phase (`hud-style.ts`) is the only consumer and a one-export file would sit
 * below the size this repo bothers giving its own header to. Both are pure data
 * shapes - nothing here parses or resolves anything.
 */

/** A number, or an expression evaluated against the data scope. The property
 *  panel writes the second form the moment a variable or a formula is picked;
 *  everything else in the document stays a bare number. */
type Value = number | { from: 'data'; expr: string };

/** One stop in a gradient - a position 0-1 and the colour at it. */
interface GradientStop { at: number; color: string }

/** A fill: a flat colour, a gradient, or a tiled/stretched image. */
type Paint =
  | string
  | { gradient: 'linear' | 'radial'; angle?: Value; stops: GradientStop[] }
  | { image: string; repeat?: 'none' | 'repeat' | 'repeat-x' | 'repeat-y'; size?: 'contain' | 'cover' | 'tile' };

export type { GradientStop, Paint, Value };
