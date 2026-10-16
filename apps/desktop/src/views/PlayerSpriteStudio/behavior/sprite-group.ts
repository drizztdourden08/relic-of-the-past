/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import { HINTS } from '../PlayerSpriteStudio.constants';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const spriteGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { sheet, canCreate, busy, draft, run } = params;

  return {
    id: 'sprite',
    label: 'Sprite',
    actions: [
      {
        id: 'create',
        label: 'New sprite',
        hint: canCreate ? HINTS.create : HINTS.createLocked,
        disabled: busy || !canCreate,
        onSelect: () => run(draft.createNew),
      },
      { id: 'close', label: 'Close', variant: 'ghost', hint: HINTS.close, disabled: busy || sheet === null, onSelect: draft.close },
    ],
  };
};

export { spriteGroup };
