/* @layer renderer-components @kind constants */
import { createElement } from 'react';
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { StatusFilter } from '@rotp/game-data';
import { Icon } from '@drizztdourden08/tessera/primitives';
import type { SegmentOption } from '@drizztdourden08/tessera/primitives';
import { GRID_PATHS, LIST_DETAIL_PATHS, LIST_PATHS } from '../ChecksTracker.constants';
import type { ViewMode } from '../ChecksTracker.type';
import { CheckStatusIcon } from './CheckStatusIcon';

const viewModeOptions = (t: I18n['t']): SegmentOption<ViewMode>[] => [
  { value: 'compact', label: createElement(Icon, { path: { d: LIST_PATHS }, size: 13 }), title: t('compounds:tracker.view.compact') },
  { value: 'detailed', label: createElement(Icon, { path: { d: LIST_DETAIL_PATHS }, size: 13 }), title: t('compounds:tracker.view.detailed') },
  { value: 'visual', label: createElement(Icon, { path: { d: GRID_PATHS }, size: 13 }), title: t('compounds:tracker.view.visual') },
];

const statusOptions = (t: I18n['t']): SegmentOption<StatusFilter>[] => [
  { value: 'all', label: t('compounds:tracker.filter.all'), title: t('compounds:tracker.filter.all-title') },
  { value: 'completed', label: createElement(CheckStatusIcon, { status: 'completed' }), title: t('compounds:tracker.filter.taken') },
  { value: 'reachable', label: createElement(CheckStatusIcon, { status: 'reachable' }), title: t('compounds:tracker.filter.available') },
  { value: 'blocked', label: createElement(CheckStatusIcon, { status: 'blocked' }), title: t('compounds:tracker.filter.left') },
];

export { statusOptions, viewModeOptions };
