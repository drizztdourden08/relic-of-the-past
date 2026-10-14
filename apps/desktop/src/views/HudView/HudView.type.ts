/* @layer renderer-hud @kind types */
import type { RefObject } from 'react';
import type { HudData } from '../../hooks/hooks.type';

interface HudViewProps {
  slideTransform?: string;
  slideTransition?: string;
}

interface HudScaleParams {
  ratio: string;
  customW: number;
  customH: number;
}

interface HudScale {
  containerRef: RefObject<HTMLDivElement | null>;
  scale: number;
  hudWidth: number | undefined;
}

interface HudCountsProps {
  data: HudData;
  showMaxInYellow: boolean;
  scale: number;
  spritesBase: string;
}

interface HudLeftClusterProps {
  data: HudData;
  magicMode: 'original' | 'accurate';
  showCounts: boolean;
  showMaxInYellow: boolean;
  scale: number;
  spritesBase: string;
}

export type { HudCountsProps, HudLeftClusterProps, HudScale, HudScaleParams, HudViewProps };
