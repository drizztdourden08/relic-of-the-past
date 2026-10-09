/* @layer store-site @kind constants */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { Chip } from '@site-kit/components/Chip/Chip';
import type { OwnedState } from './ItemCard.type';

const OWNED_CHIPS: Record<OwnedState, ReactNode> = {
  installed: createElement(Chip, { tone: 'green' }, 'installed'),
  update: createElement(Chip, { tone: 'gold' }, 'update'),
};

export { OWNED_CHIPS };
