/* @layer shared-types @kind types */
/**
 * `animation` and `transition` - two property sections any node may carry,
 * not a new object (phase 6 of `plans/hud-data-binding.html`, "Motion").
 *
 * ANIMATION RUNS ON ITS OWN CLOCK. Gated by an expression (`when`, absent =
 * always), it samples a `keyframes` track over `duration`/`delay` ms,
 * repeating per `loop`. `steps(n)` is what turns a `property: 'x'` animation
 * over a clipped box into a frame-exact sprite-sheet flipbook instead of a
 * smooth slide - the one thing a GIF cannot be: paused with the game,
 * staggered per `repeat` index (`delay: 'index * 80'`), or driven by data.
 *
 * TRANSITION FIRES WHEN A BOUND VALUE CHANGES - a different clock entirely.
 * Picking up an arrow eases the counter's own properties instead of
 * snapping them. `enter`/`exit` are the same idea applied to a node itself
 * appearing or disappearing (a `repeat` gaining or losing an instance) -
 * "a bound value changed" has no meaning for a node that did not exist a
 * frame ago, so those get their own two fields instead.
 *
 * THE REFLOW RULE (see `shared/hud/engine/motion.ts`'s `REFLOW_PROPERTIES`
 * and `shared/hud/layouts/validate-motion-warnings.ts`): `scale`, `opacity`,
 * `x`, `y`, `rotate` and `tint` are drawn AFTER placement and structurally
 * cannot move a sibling - the renderer only ever applies them as a transform/
 * filter/opacity overlay on a node's OWN already-placed box. `width`/`height`
 * are allowed but flagged when the animated node sits inside a flow
 * container (a flex row/column or a grid) - a pulsing width that shoves the
 * magic bar every frame is a HUD that will not sit still.
 */

import type { Value } from './hud-value';

/** The six properties that never move a sibling, plus the two that can. */
type HudAnimatableProperty = 'scale' | 'opacity' | 'x' | 'y' | 'rotate' | 'tint' | 'width' | 'height';

type HudAnimationLoop = 'none' | 'loop' | 'ping-pong';

/** The five named curves, or `steps(n)` for an integer n >= 1 - the family
 *  the sprite-sheet flipbook needs. Checked against the exact shape at
 *  validation (`validate-motion.ts`); this type documents it without
 *  pretending a template literal can check an author-typed string. */
type HudNamedEasing = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
type HudEasing = HudNamedEasing | string;

/** One point on the track. `at` is a 0-1 fraction of the animation's own
 *  `duration`, never wall-clock time. `easing` between this keyframe and the
 *  next overrides the animation's own `easing` for that one span only. */
interface HudAnimationKeyframe { at: number; value: Value; easing?: HudEasing }

interface HudAnimation {
  /** Expr gate. Absent = always. Evaluated the same way a `switch` case's
   *  `when` is - truthy (non-zero), never parsed as a `Value`. */
  when?: string;
  property: HudAnimatableProperty;
  /** At least two - a single point has nothing to animate between. */
  keyframes: HudAnimationKeyframe[];
  /** ms. */
  duration: Value;
  /** ms. `index * 80` staggers a repeat so ten hearts do not pulse in
   *  lockstep - see the worked proof in `tests/hud/hud-motion.keep.test.ts`. */
  delay?: Value;
  loop: HudAnimationLoop;
  /** The default for every span; a keyframe's own `easing` overrides it
   *  for the span leading INTO that keyframe. */
  easing?: HudEasing;
}

type HudTransitionProperty = 'size' | 'position' | 'opacity' | 'scale' | 'tint' | 'color';

/** What an enter/exit fades or scales through - a narrower set than a value
 *  transition's, since "the node itself arriving/leaving" only ever reads as
 *  a fade, a scale-in/out, or a small position settle, never a colour swap. */
type HudEnterExitProperty = 'opacity' | 'scale' | 'position';

interface HudEnterExitTransition {
  properties: HudEnterExitProperty[];
  duration: Value;
  easing?: HudEasing;
}

interface HudTransition {
  /** Which of THIS node's own moving properties ease, not snap. */
  properties: HudTransitionProperty[];
  duration: Value;
  easing?: HudEasing;
  /** Expr gate, with one extra name available only here: `delta` - the
   *  signed change in whichever property changed (see `motion.ts`'s
   *  `transitionDelta`). "Only ease increases" is `delta > 0`. */
  when?: string;
  /** A `repeat` instance appearing - a fade-in, not a value snapping. */
  enter?: HudEnterExitTransition;
  /** A `repeat` instance disappearing. */
  exit?: HudEnterExitTransition;
}

export type {
  HudAnimatableProperty, HudAnimation, HudAnimationKeyframe, HudAnimationLoop, HudEasing, HudEnterExitProperty,
  HudEnterExitTransition, HudNamedEasing, HudTransition, HudTransitionProperty,
};
