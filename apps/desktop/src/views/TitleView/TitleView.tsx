/* @layer renderer-hud @kind component */
import { useCallback, useRef, useState } from 'react';
import { resolveTitleSword } from '@rotp/game-data';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { HudBox } from '../../primitives/HudBox';
import { useTitleSettingsStore } from '../../stores/title-settings-store';
import { useTitleGeometry } from './behavior/useTitleGeometry';
import { useTitleAssets } from './behavior/useTitleAssets';
import { useTitleProgress } from './behavior/useTitleProgress';
import { useTitleLoop } from './behavior/useTitleLoop';
import { TitlePrompts } from './sub-components/TitlePrompts';
import type { TitleViewProps } from './TitleView.type';
import './TitleView.css';

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
    <HudBox ref={containerRef} layout="overlay" data-testid="title-view">
      <Canvas ref={canvasRef} className="title-view__canvas" />
      {resting && geometry && <TitlePrompts geometry={geometry} scale={scale} />}
    </HudBox>
  );
};

export { TitleView };
