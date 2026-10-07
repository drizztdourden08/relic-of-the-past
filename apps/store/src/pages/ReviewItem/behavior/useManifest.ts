/* @layer store-site @kind hook */
/**
 * The pack's manifest, read from the head of the pack through its PackSource: the first
 * MiB, where every container keeps it as entry 0, parsed by the same reader the store API
 * checks uploads with.
 */
import { useEffect, useState } from 'react';
import type { PackSource } from '@domains/packs/pack-source.type';
import { STORE_LIMITS } from '@shared/store/limits';
import { readFirstEntry } from '@shared/store/manifest/read-first-entry';
import type { FirstEntry, FirstEntryFailure } from '@shared/store/manifest/read-first-entry';
import { errorMessage } from '@site-kit/api/api-error';

type ManifestResult = { source: PackSource; entry: FirstEntry | null; error: string | null };

type ManifestState = { entry: FirstEntry | null; error: string | null; loading: boolean };

const FAILURES: Record<FirstEntryFailure, string> = {
  'not-zip': 'The pack is not a zip archive.',
  truncated: 'The manifest does not fit in the head of the pack.',
  encrypted: 'The manifest is encrypted.',
  streamed: 'The pack keeps its sizes after the data, so the manifest cannot be read from its head.',
  method: 'The manifest is packed in a way the store does not read.',
  'too-large': 'The manifest is larger than the store allows.',
  inflate: 'The manifest could not be unpacked.',
  json: 'The manifest is not valid JSON.',
};

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
export type { ManifestState };
