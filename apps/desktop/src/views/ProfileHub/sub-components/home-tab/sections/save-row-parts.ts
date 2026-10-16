/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { ItemListRowParts } from '@drizztdourden08/tessera/composites';
import { Spinner } from '@drizztdourden08/tessera/primitives';
import { SaveRowThumb } from '@app/compounds/SaveRowThumb';
import { EMPTY_SAVE_LABEL } from '../home-tab.constants';
import type { SaveRowPartsInput } from '../home-tab.type';

const metaOf = (timestamp: number | null, busy: boolean): ReactNode => {
  if (busy) return createElement(Spinner, { size: 'sm' });
  return timestamp === null ? EMPTY_SAVE_LABEL : createElement(DateText, { value: timestamp, format: 'relative' });
};

const saveRowParts = (input: SaveRowPartsInput): ItemListRowParts => {
  const { screenshotUrl, timestamp, busy } = input;
  return { icon: createElement(SaveRowThumb, { src: screenshotUrl }), meta: metaOf(timestamp, busy) };
};

export { saveRowParts };
