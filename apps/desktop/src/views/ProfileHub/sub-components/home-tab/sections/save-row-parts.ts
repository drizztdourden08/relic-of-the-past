/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { ItemListRowParts } from '@drizztdourden08/tessera/composites';
import { Spinner } from '@drizztdourden08/tessera/primitives';
import { SaveRowThumb } from '@app/compounds/SaveRowThumb';
import type { SaveRowPartsInput } from '../home-tab.type';

const saveRowParts = (input: SaveRowPartsInput): ItemListRowParts => {
  const { screenshotUrl, timestamp, busy } = input;
  return {
    icon: createElement(SaveRowThumb, { src: screenshotUrl }),
    meta: busy ? createElement(Spinner, { size: 'sm' }) : createElement(DateText, { value: timestamp, format: 'relative' }),
  };
};

export { saveRowParts };
