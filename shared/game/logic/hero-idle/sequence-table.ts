/* @layer shared-game @kind data */
/**
 * WHAT THE CHARACTER DOES WHEN NOBODY IS ASKING. The whole behaviour, as a
 * table.
 *
 * One row per thing they can be seen doing. `weight` is a relative
 * likelihood, so retuning the idle means editing numbers here and nothing
 * else; `frames` is the range the take's length is sampled from, in GAME
 * frames at 60 a second, and is omitted where the game's own tables already
 * fix the length (a sword swing is as long as a sword swing).
 *
 * The ordering below is the ordering of the answer to "what is it usually
 * doing?" It paces most of the time, stands and swings often, and does the two
 * flourishes rarely enough to still be a small surprise on the twentieth time
 * the menu is opened.
 *
 *   walk   34/91   ≈ 37%
 *   swing  22/91   ≈ 24%
 *   stand  14/91   ≈ 15%
 *   look   10/91   ≈ 11%
 *   spin    8/91   ≈  9%
 *   raise   3/91   ≈  3%
 *
 * The walk range is quantised to whole out-and-back pairs by the builder, so
 * the numbers here are the outer bounds it rounds inside, from one pair (68) to
 * two (136), 1.1 to 2.3 seconds.
 */
import type { HeroSequenceDef } from './hero-idle.type';

const HERO_SEQUENCES: readonly HeroSequenceDef[] = [
  { id: 'walk', kind: 'pace', weight: 34, facing: 'random', frames: [68, 136] },
  { id: 'swing', kind: 'swing', weight: 22, facing: 'keep' },
  { id: 'stand', kind: 'still', weight: 14, facing: 'keep', frames: [45, 110] },
  { id: 'look', kind: 'look', weight: 10, facing: 'random', frames: [54, 108] },
  { id: 'spin', kind: 'charge-spin', weight: 8, facing: 'keep' },
  { id: 'raise', kind: 'flourish', weight: 3, facing: 'toward-viewer' },
];

/** Where the idler starts, and where it returns after a facing-less flourish. */
const FACING_TOWARD_VIEWER = 1;

/**
 * The same sequence twice in a row reads as a stutter and not as a choice,
 * so the chooser refuses an immediate repeat. Standing is the exception: it is
 * allowed to follow itself because two rests in a row is just a longer rest.
 */
const REPEATABLE: ReadonlySet<string> = new Set(['stand']);

export { FACING_TOWARD_VIEWER, HERO_SEQUENCES, REPEATABLE };
