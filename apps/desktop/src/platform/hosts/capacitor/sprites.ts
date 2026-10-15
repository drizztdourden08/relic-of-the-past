/* @layer renderer-other @kind logic */
import { Capacitor } from '@capacitor/core';
import { Filesystem } from '@capacitor/filesystem';
import type { SpritesPort } from '../../sprites-port.type';
import { DIR } from './capacitor.constants';

const createCapacitorSprites = (): SpritesPort => ({
  baseUrl: async (romFile) => {
    const stem = romFile.replace(/\.(sfc|smc)$/i, '');
    try {
      const { uri } = await Filesystem.getUri({ path: `sprites/${stem}`, directory: DIR });
      return `${Capacitor.convertFileSrc(uri)}/`;
    } catch { return ''; }
  },
});

export { createCapacitorSprites };
