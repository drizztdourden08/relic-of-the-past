/* @layer shared-hud @kind logic */
/**
 * THE §57 REWRITE: a flex container's single `gap` becomes the `{ x, y }` pair
 * a grid always had. Run ONCE on load, on the raw untrusted value, before the
 * validator ever sees it - the same expand-and-forget discipline §26 gave the
 * four opaque element kinds and §42 gave `regions`/`stack`. NO ALIAS SURVIVES:
 * a bare `gap` is not a shape `validate-container.ts` accepts any more, so a
 * stored document opens correctly and is SAVED in the new shape.
 *
 * WHY IT IS PIXEL-IDENTICAL. The flow engine already spent that ONE number on
 * TWO gaps: `place-flow.ts` put it between items along the main axis AND
 * between wrapped lines across the cross axis (`flow.ts::linesSize`). So
 * `{ x: n, y: n }` is not a new arrangement - it is the arrangement written
 * down honestly, and every layout that shipped places to the same pixel.
 *
 * A BOUND GAP MIGRATES TOO. `{ from: 'data', expr }` is one `Value`, and the
 * pair takes the SAME expression on both axes - which is what the engine
 * resolved it to on both axes before.
 *
 * A GRID IS NOT TOUCHED (it is already a pair), and neither is a container
 * whose `gap` already names `x` or `y` - re-running this on a migrated
 * document is a no-op, which is what lets it sit in front of the validator
 * for every load instead of behind a version flag.
 */

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** Already the pair? Only a record naming `x` or `y` is - a bound `Value` is a
 *  record too, and it is exactly what has to be split. */
const isPair = (gap: unknown): boolean => isRecord(gap) && ('x' in gap || 'y' in gap);

/**
 * The `gap` key one raw container should carry, as a patch to spread over it:
 * empty when there is nothing to do, `{ gap: { x, y } }` when the old single
 * value has to be split across both axes.
 */
const gapPatch = (value: Raw): Raw => {
  if (value.layout === 'grid') return {};
  const { gap } = value;
  if (gap === undefined || isPair(gap)) return {};
  return { gap: { x: gap, y: gap } };
};

export { gapPatch };
