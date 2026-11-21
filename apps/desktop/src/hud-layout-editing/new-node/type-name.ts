/* @layer renderer-components @kind logic */
import type { Translate } from '@app/hud-layout-editing/translate.type';

const typeName = (t: Translate, type: string): string => {
  switch (type) {
    case 'row': return t('hud-editing:node.row');
    case 'column': return t('hud-editing:node.column');
    case 'grid': return t('hud-editing:node.grid');
    case 'text': return t('hud-editing:node.text');
    case 'repeat': return t('hud-editing:node.repeat');
    case 'switch': return t('hud-editing:node.switch');
    case 'spacer': return t('hud-editing:node.spacer');
    case 'shape': return t('hud-editing:node.shape');
    case 'countdown': return t('hud-editing:node.countdown');
    default: return type;
  }
};

export { typeName };
