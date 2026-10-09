/* @layer shared-storage @kind logic */
import { setDir } from './set-dir';

const setFilePath = (id: string, name: string): string => `${setDir(id)}/${name}`;

export { setFilePath };
