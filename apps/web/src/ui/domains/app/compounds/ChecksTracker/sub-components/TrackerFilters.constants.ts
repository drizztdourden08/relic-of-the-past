/* @layer renderer-components @kind constants */
import { createElement } from 'react';
import type { StatusFilter } from '@shared/game/logic/queries/check-grouping';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import { GRID_PATHS, LIST_DETAIL_PATHS, LIST_PATHS } from '../ChecksTracker.constants';
import type { ViewMode } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';

const VIEW_MODE_OPTIONS: SegmentOption<ViewMode>[] = [
  { value: 'compact', label: createElement(Icon, { path: { d: LIST_PATHS }, size: 13 }), title: 'Compact rows' },
  { value: 'detailed', label: createElement(Icon, { path: { d: LIST_DETAIL_PATHS }, size: 13 }), title: 'Rows with items' },
  { value: 'visual', label: createElement(Icon, { path: { d: GRID_PATHS }, size: 13 }), title: 'Item cards' },
];

const STATUS_OPTIONS: SegmentOption<StatusFilter>[] = [
  { value: 'all', label: 'All', title: 'Every status' },
  { value: 'completed', label: createElement(CheckStatusIcon, { status: 'completed' }), title: 'Taken' },
  { value: 'reachable', label: createElement(CheckStatusIcon, { status: 'reachable' }), title: 'Available' },
  { value: 'blocked', label: createElement(CheckStatusIcon, { status: 'blocked' }), title: 'Left' },
];

export { STATUS_OPTIONS, VIEW_MODE_OPTIONS };
