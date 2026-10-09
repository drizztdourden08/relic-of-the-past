/* @layer shared-types @kind types */
import type { StoreKind } from '@rotp/hub-contracts';

type StoreResult<T> = { ok: true; data: T } | { ok: false; error: string; signedOut: boolean };

type StoreDuplicateResult = { kind: StoreKind; name: string };

interface StoreInvokeContract {
  'store:duplicate': (itemId: string) => Promise<StoreResult<StoreDuplicateResult>>;
}

export type { StoreInvokeContract, StoreResult, StoreDuplicateResult };
