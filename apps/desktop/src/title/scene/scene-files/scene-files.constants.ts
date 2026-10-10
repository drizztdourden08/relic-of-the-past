/* @layer renderer-hud @kind constants */
import type { SceneFiles } from '../scene.type';
import { sceneFileUrl } from './scene-file-url';
import { sceneFileVariants } from './scene-file-variants';

const LIGHT_FILES = import.meta.glob('../../../../assets/title-scene/light/*.png', { eager: true, import: 'default' });

const LIGHT_SCENE_FILES: SceneFiles = {
  sky: sceneFileUrl(LIGHT_FILES, 'skybg'),
  mountains: sceneFileVariants(LIGHT_FILES, 'mountain'),
  trees: sceneFileVariants(LIGHT_FILES, 'tree'),
  clouds: sceneFileVariants(LIGHT_FILES, 'cloud'),
  landmark: sceneFileUrl(LIGHT_FILES, 'castle'),
};

export { LIGHT_SCENE_FILES };
