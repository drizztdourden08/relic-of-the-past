/* @layer renderer-hud @kind component */
import { useEffect, useMemo, useRef } from 'react';
import { Box, Canvas } from '@drizztdourden08/tessera/primitives';
import { buildScene } from '../../scene/compose-scene';
import { useBackdropGeometry } from './behavior/useBackdropGeometry';
import { useSceneAssets } from './behavior/useSceneAssets';
import { DEFAULT_HORIZON, DEFAULT_SEED, STILL } from './SceneBackdrop.constants';
import type { SceneBackdropProps } from './SceneBackdrop.type';
import './SceneBackdrop.css';

const SceneBackdrop = (props: SceneBackdropProps) => {
  const { horizon = DEFAULT_HORIZON, scale, seed = DEFAULT_SEED, className = '' } = props;
  const assets = useSceneAssets();
  const { containerRef, measured } = useBackdropGeometry(horizon, scale);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scene = useMemo(
    () => (assets && measured ? buildScene(assets, measured.geometry, seed) : null),
    [assets, measured, seed],
  );
  const canvasStyle = useMemo(
    () => (scene && measured ? { width: scene.geometry.width * measured.scale, height: scene.geometry.height * measured.scale } : undefined),
    [scene, measured],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!scene || !canvas) return;
    canvas.width = scene.geometry.width;
    canvas.height = scene.geometry.height;
    const ctx = canvas.getContext('2d');
    if (ctx) scene.draw(ctx, STILL);
  }, [scene]);

  return (
    <Box ref={containerRef} className={`scene-backdrop${className ? ` ${className}` : ''}`} aria-hidden="true">
      {scene && <Canvas ref={canvasRef} className="scene-backdrop__canvas" style={canvasStyle} />}
    </Box>
  );
};

export { SceneBackdrop };
