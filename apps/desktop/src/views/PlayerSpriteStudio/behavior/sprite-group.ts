/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const spriteGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { busy, draft } = params;

  return {
    id: 'sprite',
    label: 'Sprite',
    actions: [{ id: 'close', label: 'Close', variant: 'ghost', disabled: busy, onSelect: draft.close }],
  };
};

export { spriteGroup };
