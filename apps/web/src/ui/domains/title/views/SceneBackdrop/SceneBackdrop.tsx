/* @layer renderer-hud @kind component */
/**
 * The title's lake scene, drawn once and still, as the background of a box: the same tiles and
 * compositor as the reimagined title screen, at a whole-number pixel scale so it stays pixel art.
 * Nothing shows until the tiles have decoded, so the box keeps its own colour underneath.
 */
import { useEffect, useMemo, useRef } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Canvas } from '../../../../design-system/primitives/Canvas';
import { buildScene, type SceneOptions } from '../../scene/compose-scene';
import type { SceneClock } from '../../scene/scene.type';
import { useBackdropGeometry } from './behavior/useBackdropGeometry';
import { useSceneAssets } from './behavior/useSceneAssets';
import type { SceneBackdropProps } from './SceneBackdrop.type';
import './SceneBackdrop.css';

const STILL: SceneClock = { t: 0, drift: 0, moving: false };
/* Still water has no moving patches: frozen, they read as squares on the lake. */
const STILL_SCENE: SceneOptions = { movingWater: false };
const DEFAULT_HORIZON = 0.62;
const DEFAULT_SEED = 7;

const SceneBackdrop = (props: SceneBackdropProps) => {
  const { horizon = DEFAULT_HORIZON, scale, seed = DEFAULT_SEED, className = '' } = props;
  const assets = useSceneAssets();
  const { containerRef, measured } = useBackdropGeometry(horizon, scale);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scene = useMemo(
    () => (assets && measured ? buildScene(assets, measured.geometry, seed, STILL_SCENE) : null),
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
