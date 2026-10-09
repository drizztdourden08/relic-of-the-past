/* @layer renderer-hud @kind component */
import { useCallback, useRef, useState } from 'react';
import { resolveTitleSword } from '@shared/game/title/title-swords';
import { Canvas } from '@drizztdourden08/tessera/primitives';
import { HudBox } from '../../../hud/primitives/HudBox';
import { useTitleSettingsStore } from '../../../../../stores/title-settings-store';
import { useTitleGeometry } from './behavior/useTitleGeometry';
import { useTitleAssets } from './behavior/useTitleAssets';
import { useTitleProgress } from './behavior/useTitleProgress';
import { useTitleLoop } from './behavior/useTitleLoop';
import { TitlePrompts } from './sub-components/TitlePrompts';
import { CANVAS, FULL } from './TitleView.constants';
import type { TitleViewProps } from './TitleView.type';

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
