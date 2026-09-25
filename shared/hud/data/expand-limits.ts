/* @layer shared-hud @kind constants */
/**
 * The two numbers guarding `repeat`/`switch` expansion
 * (`shared/hud/engine/expand.ts`, phase 3 of `plans/hud-data-binding.html`)
 * against ever drawing an unbounded tree - `ceil(1 / 0)` must not become a
 * repeat count of a million hearts. Both live here, a leaf both the engine
 * and the validator already import from, instead of in `engine/`, because the
 * validator's static budget check (`shared/hud/layouts/validate-expand-
 * budget.ts`) needs the same numbers and must not depend on the engine.
 *
 * MAX_REPEAT_COUNT bounds ONE repeat's own resolved count, clamped at
 * runtime. 200 sits comfortably above every real use this document model has
 * today - twenty heart containers at full capacity, the widest keyboard
 * glyph pack's 107 positions, any plausible slot list - while stopping a
 * runaway expression's result (already folded to at most 1,000,000 by
 * `resolveValue`'s own clamp, `resolve-value.ts`) from ever reaching the
 * engine's per-node measure/place passes at that scale.
 *
 * MAX_EXPANDED_NODES bounds a WHOLE document's worst-case node count, checked
 * statically at load time and enforced again at runtime as `expand.ts`
 * actually unrolls (belt and braces: the static bound prices every repeat and
 * switch independently, and real data could still add up differently than
 * the worst case assumed). 5,000 is generous next to any real layout - the
 * built-ins place well under a hundred nodes even fully expanded - while
 * refusing a document that NESTS repeats deep enough to multiply past it
 * (200 x 200 is already 8x over, which is exactly the shape this exists to
 * catch).
 */
const MAX_REPEAT_COUNT = 200;
const MAX_EXPANDED_NODES = 5000;

export { MAX_EXPANDED_NODES, MAX_REPEAT_COUNT };
