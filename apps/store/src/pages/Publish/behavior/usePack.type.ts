/* @layer store-site @kind types */
import type { Container, StoreKind } from '@shared/store/types';
import type { usePack } from './usePack';

type PackCheck = { container: Container | null; kind: StoreKind | null; problem: string | null };

type PackState = ReturnType<typeof usePack>;

export type { PackCheck, PackState };
