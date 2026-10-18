/* @layer renderer-components @kind logic */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { DateText } from '@drizztdourden08/tessera/composites';
import type { ItemListRowParts } from '@drizztdourden08/tessera/composites';
import { Image, Span, Spinner } from '@drizztdourden08/tessera/primitives';
import { ARMED_PROMPTS } from '../home-tab.constants';
import type { SaveRowPartsInput } from '../home-tab.type';

const metaOf = ({ timestamp, busy, armed }: SaveRowPartsInput): ReactNode => {
  if (busy) return createElement(Spinner, { size: 'sm' });
  if (armed) return createElement(Span, { tone: 'primary' }, ARMED_PROMPTS[armed]);
  return createElement(DateText, { value: timestamp, format: 'relative' });
};

const saveRowParts = (input: SaveRowPartsInput): ItemListRowParts => ({
  media: createElement(Image, { src: input.screenshotUrl ?? undefined, alt: '', fit: 'cover', pixelated: true }),
  meta: metaOf(input),
});

export { saveRowParts };
