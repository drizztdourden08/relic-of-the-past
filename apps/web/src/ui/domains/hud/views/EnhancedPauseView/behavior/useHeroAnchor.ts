/* @layer renderer-hud @kind hook */
/**
 * Where on screen the live player character is standing.
 *
 * The menu draws its portrait THERE instead of in a reserved column, so the
 * position has to come from the game and not from a layout constant. It is
 * read once per open and again whenever the save's own `linkX`/`linkY` move,
 * which under a held menu is never. The world is parked, so a per-frame poll
 * would be sixty reads a second of two numbers that cannot change.
 *
 * The store's copy of the position is the TRIGGER, not the answer: the answer
 * comes from the viewport query, which reports the position and the camera it
 * has to be measured against from the same frame. Two reads of the same value
 * from two different frames is exactly the class of bug that makes an overlay
 * drift by a pixel when the view re-centres.
 */
import { useEffect, useState } from 'react';
import { wasmGetViewportInfo } from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { heroScreenPoint } from './hero-anchor';
import type { ScreenPoint } from './hero-anchor';

const useHeroAnchor = (active: boolean): ScreenPoint | null => {
  const linkX = useGameUIStore((s) => s.map.linkX);
  const linkY = useGameUIStore((s) => s.map.linkY);
  const [anchor, setAnchor] = useState<ScreenPoint | null>(null);

  useEffect(() => {
    if (!active) {
      setAnchor(null);
      return;
    }
    const vp = wasmGetViewportInfo();
    // A refused or not-yet-running query reports zeros; drawing the character
    // in the corner of the screen is worse than not drawing them at all.
    if (!vp || vp.snesWidth === 0) return;
    const next = heroScreenPoint(vp);
    setAnchor((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next));
  }, [active, linkX, linkY]);

  return anchor;
};

export { useHeroAnchor };
