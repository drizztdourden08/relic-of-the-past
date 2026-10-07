/* @layer renderer-hud @kind component */
/**
 * The reimagined title screen, drawn over the hidden native one on the core's own clock. One canvas
 * in game pixels, scaled by the browser with smoothing off, covering the whole game view, and the
 * button prompts over it once the picture is finished.
 */
import { useCallback, useRef, useState } from 'react';
import { resolveTitleSword } from '@shared/game/title/title-swords';
import { Canvas } from '../../../../design-system/primitives/Canvas';
import { HudBox } from '../../../hud/primitives/HudBox';
import { useTitleSettingsStore } from '../../../../../stores/title-settings-store';
import { useTitleGeometry } from './behavior/useTitleGeometry';
import { useTitleAssets } from './behavior/useTitleAssets';
import { useTitleProgress } from './behavior/useTitleProgress';
import { useTitleLoop } from './behavior/useTitleLoop';
import { TitlePrompts } from './sub-components/TitlePrompts';
import type { TitleViewProps } from './TitleView.type';

const FULL = { position: 'absolute', inset: 0, pointerEvents: 'none' } as const;
const CANVAS = { width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' } as const;

const TitleView = ({ profileId }: TitleViewProps) => {
  const { motion, followsProgress, sword, dimFlashes } = useTitleSettingsStore();
  const { containerRef, geometry, scale } = useTitleGeometry();
  const progress = useTitleProgress(profileId, followsProgress);
  const assets = useTitleAssets(resolveTitleSword(sword, progress.tier));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resting, setResting] = useState(false);
  const onResting = useCallback((now: boolean) => setResting(now), []);

  useTitleLoop(canvasRef, { assets, geometry, moving: motion === 'drifting', dimFlashes, onResting });

  return (
    <HudBox ref={containerRef} style={FULL} data-testid="title-view">
      <Canvas ref={canvasRef} style={CANVAS} />
      {resting && geometry && <TitlePrompts geometry={geometry} scale={scale} />}
    </HudBox>
  );
};

export { TitleView };
