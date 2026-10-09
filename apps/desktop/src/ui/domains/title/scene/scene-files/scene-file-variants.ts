/* @layer renderer-hud @kind logic */
import { sceneFileName } from './scene-file-name';

const sceneFileVariants = (files: Record<string, string>, stem: string): string[] =>
  Object.entries(files)
    .map(([path, url]) => ({ name: sceneFileName(path), url }))
    .filter(({ name }) => name.startsWith(`${stem}_`))
    .sort((a, b) => Number(a.name.slice(stem.length + 1)) - Number(b.name.slice(stem.length + 1)))
    .map(({ url }) => url);

export { sceneFileVariants };
