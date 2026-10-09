/* @layer store-site @kind types */
import type { StoreKind } from '@shared/store/types';

type PublicationTarget = { kind: 'version'; n: number } | { kind: 'listing'; editId: string } | { kind: 'none' };

type PublicationRow = {
  id: string;
  itemId: string;
  item: string;
  entry: string;
  kind: StoreKind;
  semver: string;
  review: string;
  file: string;
  submitted: string;
  reviewedBy: string;
  reviewedAt: string;
  note: string;
  installs: string;
};

export type { PublicationRow, PublicationTarget };
