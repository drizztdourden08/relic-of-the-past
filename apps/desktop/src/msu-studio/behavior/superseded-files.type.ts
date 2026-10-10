/* @layer renderer-components @kind types */
import type { MsuPackManifest } from '@rotp/game-data';
import type { MsuFile } from '../msu.type';

interface SupersededParams {
  pack: string;
  files: MsuFile[];
  saveBase: MsuPackManifest | null;
  reload: () => void;
}

export type { SupersededParams };
