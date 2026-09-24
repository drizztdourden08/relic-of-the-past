/* @layer renderer-hud @kind data */
/**
 * The scene tiles bundled under apps/web/src/assets/title-scene/light/: one strip of sky, every
 * numbered variant of the mountains, trees, clouds and moving water the folder holds, plus the
 * castle. The same shape as the title screen's own lookup, so the two can become one.
 */

// path -> bundled url
const LIGHT_FILES = import.meta.glob('../../../../assets/title-scene/light/*.png', { eager: true, import: 'default' }) as Record<string, string>;

const nameOf = (path: string): string => path.slice(path.lastIndexOf('/') + 1, -'.png'.length);

/** Every `<stem>_<n>.png` in the folder, in numeric order. */
const variantsOf = (files: Record<string, string>, stem: string): string[] =>
  Object.entries(files)
    .map(([path, url]) => ({ name: nameOf(path), url }))
    .filter(({ name }) => name.startsWith(`${stem}_`))
    .sort((a, b) => Number(a.name.slice(stem.length + 1)) - Number(b.name.slice(stem.length + 1)))
    .map(({ url }) => url);

const oneOf = (files: Record<string, string>, name: string): string => {
  const hit = Object.entries(files).find(([path]) => nameOf(path) === name);
  return hit ? hit[1] : '';
};

interface SceneFiles {
  sky: string;
  mountains: string[];
  trees: string[];
  clouds: string[];
  caustics: string[];
  landmark: string;
}

const LIGHT_SCENE_FILES: SceneFiles = {
  sky: oneOf(LIGHT_FILES, 'skybg'),
  mountains: variantsOf(LIGHT_FILES, 'mountain'),
  trees: variantsOf(LIGHT_FILES, 'tree'),
  clouds: variantsOf(LIGHT_FILES, 'cloud'),
  caustics: variantsOf(LIGHT_FILES, 'caustics'),
  landmark: oneOf(LIGHT_FILES, 'castle'),
};

export { LIGHT_SCENE_FILES };
export type { SceneFiles };
