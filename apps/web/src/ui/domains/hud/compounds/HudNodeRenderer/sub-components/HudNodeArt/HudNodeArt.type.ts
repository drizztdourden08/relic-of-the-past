/* @layer renderer-hud @kind types */
import type { PlacedNode } from '@shared/hud/engine';
import type { HudNodeContent } from '../../HudNodeRenderer.type';

interface HudNodeArtProps {
  placed: PlacedNode;
  /** Display pixels per SNES pixel. */
  scale: number;
  content: HudNodeContent;
  spritesBase: string;
  /** The scope a `text` element's bound `value` resolves against - the same
   *  table `HudNodeRenderer`'s own `style` resolution already reads. */
  dataScope: Readonly<Record<string, number>>;
}

export type { HudNodeArtProps };
