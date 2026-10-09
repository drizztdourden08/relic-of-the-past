/* @layer renderer-hud @kind logic */
const sceneFileName = (path: string): string => path.slice(path.lastIndexOf('/') + 1, -'.png'.length);

export { sceneFileName };
