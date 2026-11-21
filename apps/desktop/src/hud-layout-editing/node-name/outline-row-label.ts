/* @layer renderer-components @kind logic */
import { labelOf } from '../new-node';
import { builtInNodeName } from './built-in-node-name';
import { nodeName } from './node-name';
import type { Translate } from '../translate.type';
import type { OutlineRowModel } from '@app/views/HudLayoutEditor/sub-components/OutlinePanel.type';

const outlineRowLabel = (row: OutlineRowModel, t: Translate): string => (row.isScreen
  ? builtInNodeName(row.node.id, t) ?? t('hud-editor:outline.screen', { id: row.node.id })
  : t('hud-editor:outline.row', { label: labelOf(row.node, t), id: nodeName(row.node.id, t) }));

export { outlineRowLabel };
