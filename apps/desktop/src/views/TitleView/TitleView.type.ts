/* @layer renderer-hud @kind types */
import type { SceneAssets, SceneGeometry } from '../../title/scene/scene.type';
import type { TitlePictures } from '../../title/choreography/choreography.type';

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
