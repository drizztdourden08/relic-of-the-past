/* @layer store-site @kind types */
import type { ReactNode } from 'react';
import type { ItemCardView } from '@rotp/hub-contracts';

type OwnedState = 'installed' | 'update';

type ItemCardProps = {
  item: ItemCardView;
  to: string;
  selected?: boolean;
  owned?: OwnedState | null;
  extra?: ReactNode;
};

export type { ItemCardProps, OwnedState };
