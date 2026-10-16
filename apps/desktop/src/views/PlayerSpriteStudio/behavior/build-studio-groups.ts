/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';
import { exportGroup } from './export-group';
import { saveGroup } from './save-group';
import { spriteGroup } from './sprite-group';

const buildStudioGroups = (params: StudioGroupsParams): StudioActionGroup[] => [
  spriteGroup(params),
  saveGroup(params),
  exportGroup(params),
];

export { buildStudioGroups };
