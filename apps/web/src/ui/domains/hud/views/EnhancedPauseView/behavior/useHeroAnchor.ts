/* @layer renderer-hud @kind hook */
import { useEffect, useState } from 'react';
import { wasmGetViewportInfo } from '@app/lib/game';
import { useGameUIStore } from '@app/stores/game-ui-store';
import { heroScreenPoint } from './hero-anchor';
import type { ScreenPoint } from '../EnhancedPauseView.type';

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
    if (!vp || vp.snesWidth === 0) return;
    const next = heroScreenPoint(vp);
    setAnchor((prev) => (prev && prev.x === next.x && prev.y === next.y ? prev : next));
  }, [active, linkX, linkY]);

  return anchor;
};

export { useHeroAnchor };
