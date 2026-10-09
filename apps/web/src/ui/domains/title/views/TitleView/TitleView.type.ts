/* @layer renderer-hud @kind types */
import type { SceneAssets, SceneGeometry } from '../../scene/scene.type';
import type { TitlePictures } from '../../choreography/choreography.type';

interface TitleViewProps {
  profileId: string | null;
}

interface TitleAssets {
  scene: SceneAssets;
  pictures: TitlePictures;
}

interface PictureSource {
  url: string;
  scale: number;
}

interface LoopOptions {
  assets: TitleAssets | null;
  geometry: SceneGeometry | null;
  moving: boolean;
  dimFlashes: boolean;
  onResting: (resting: boolean) => void;
}

interface TitlePromptsProps {
  geometry: SceneGeometry;
  scale: number;
}

export type { LoopOptions, PictureSource, TitleAssets, TitlePromptsProps, TitleViewProps };
