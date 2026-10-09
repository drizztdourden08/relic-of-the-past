/* @layer electron-main @kind logic */
import { join } from 'path';
import { SOURCE_TREE_RELATIVE } from './sdl3.constants';

const addonCandidates = (): string[] => {
  const platformArch = `${process.platform}-${process.arch}`;
  return [
    ...(process.resourcesPath ? [join(process.resourcesPath, 'sdl3', platformArch, 'sdl3_input.node')] : []),
    join(__dirname, '..', '..', SOURCE_TREE_RELATIVE, platformArch, 'sdl3_input.node'),
    join(process.cwd(), SOURCE_TREE_RELATIVE, platformArch, 'sdl3_input.node'),
    join(__dirname, 'prebuilds', platformArch, 'sdl3_input.node'),
    join(__dirname, 'build', 'Release', 'sdl3_input.node')
  ];
};

export { addonCandidates };
