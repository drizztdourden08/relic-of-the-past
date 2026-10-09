/* @layer shared-hud @kind constants */
import { BOX_KEYS } from '../validate-box';
import type { HudGridJustifyItems } from '../../types/hud-node';

const DIRECTIONS = ['row', 'column'] as const;
const JUSTIFY = ['start', 'center', 'end', 'between', 'around', 'evenly'] as const;
const ALIGN = ['start', 'center', 'end'] as const;
const GRID_JUSTIFY_ITEMS: readonly HudGridJustifyItems[] = ['start', 'center', 'end', 'stretch'];

const CONTAINER_KEYS = [...BOX_KEYS, 'kind', 'layout', 'gap', 'guide', 'children'] as const;
const FLEX_KEYS = [...CONTAINER_KEYS, 'direction', 'justify', 'align', 'wrap'] as const;
const GRID_KEYS = [...CONTAINER_KEYS, 'columns', 'rows', 'justifyItems', 'alignItems'] as const;

export {
  ALIGN, CONTAINER_KEYS, DIRECTIONS, FLEX_KEYS, GRID_JUSTIFY_ITEMS, GRID_KEYS, JUSTIFY,
};
