/* @layer renderer-hud @kind types */
import type { SceneGeometry } from '../../title/scene/scene.type';

interface SceneBackdropProps {
  horizon?: number;
  scale?: number;
  seed?: number;
  className?: string;
}

interface BackdropGeometry {
  geometry: SceneGeometry;
  scale: number;
}

export type { BackdropGeometry, SceneBackdropProps };
