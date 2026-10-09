/* @layer store-site @kind hook */
import { useEffect, useState } from 'react';
import type { PackSource } from '@domains/packs/pack-source.type';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import { readFirstEntry } from '@rotp/hub-contracts';
import { errorMessage } from '@rotp/hub-client';
import { FAILURES } from './useManifest.constants';
import type { ManifestResult, ManifestState } from './useManifest.type';

const readManifest = async (source: PackSource): Promise<ManifestResult> => {
  const head = await source.range(0, Math.min(source.bytes, STORE_LIMITS.manifestHeadBytes));
  const result = await readFirstEntry(head);
  return result.ok ? { source, entry: result.entry, error: null } : { source, entry: null, error: FAILURES[result.reason] };
};

const useManifest = (source: PackSource | null): ManifestState => {
  const [result, setResult] = useState<ManifestResult | null>(null);

  useEffect(() => {
    if (!source) return undefined;
    let live = true;
    readManifest(source).then(
      (next) => { if (live) setResult(next); },
      (cause: unknown) => { if (live) setResult({ source, entry: null, error: errorMessage(cause) }); },
    );
    return () => { live = false; };
  }, [source]);

  const current = result && result.source === source ? result : null;
  return { entry: current?.entry ?? null, error: current?.error ?? null, loading: source !== null && current === null };
};

export { useManifest };
