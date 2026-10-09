/* @layer renderer-hud @kind logic */
import { sceneFileName } from './scene-file-name';

const sceneFileUrl = (files: Record<string, string>, name: string): string => {
  const hit = Object.entries(files).find(([path]) => sceneFileName(path) === name);
  return hit ? hit[1] : '';
};

export { sceneFileUrl };
