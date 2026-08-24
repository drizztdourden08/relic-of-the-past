/* @layer shared-asset-extraction @kind logic */
/**
 * The one shape every menu/credits/caption decoder returns.
 *
 * These three bodies of text live in three completely different ROM formats,
 * but an editor only ever wants the same three things from each of them: a
 * stable handle, the readable line, and how much room the screen gives it.
 */

interface DecodedLine {
  /** Stable within its body: 'credits.row-041', 'caption.scene-03.title', 'menu.copy-player'. */
  key: string;
  /** The readable English. */
  text: string;
  /** How much room the surface gives this line, for the editor's fit meter. */
  limit: { kind: 'tiles'; max: number };
}

export type { DecodedLine };
