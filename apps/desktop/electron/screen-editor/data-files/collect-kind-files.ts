/* @layer electron-main @kind logic */
import { collectFiles } from './collect-files';
import { dataPath } from './data-path';

const collectKindFiles = async (root: string, roots: readonly string[]): Promise<string[]> => {
  const nested = await Promise.all(roots.map(entry => collectFiles(dataPath(root, entry))));
  return nested.flat();
};

export { collectKindFiles };
