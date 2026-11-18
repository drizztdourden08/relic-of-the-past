/* @layer renderer-hooks @kind logic */
import type { StudioActionGroup } from '@app/studio';
import type { StudioGroupsParams } from '../PlayerSpriteStudio.type';

const spriteGroup = (params: StudioGroupsParams): StudioActionGroup => {
  const { busy, draft, t } = params;

  return {
    id: 'sprite',
    label: t('views-player-sprite-studio:sprite.group'),
    actions: [{ id: 'close', label: t('views-player-sprite-studio:sprite.close'), variant: 'ghost', disabled: busy, onSelect: draft.close }],
  };
};

export { spriteGroup };
