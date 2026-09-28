/* @layer store-site @kind hook */
/**
 * The signed link to one version's pack, fetched once per version, and the pack as a
 * PackSource read in ranges over it. When a range read fails because the link lapsed, the
 * source fetches a new one by itself. `n` null means there is no pack to read.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PackSource } from '@domains/packs/pack-source.type';
import type { ReviewPackResponse } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { reviewPack } from '../../../api/review-endpoints';
import { rangePackSource } from './range-pack-source';

type LinkResult = { key: string; link: ReviewPackResponse | null; error: string | null };

type PackLink = {
  source: PackSource | null;
  error: string | null;
  loading: boolean;
};

const usePackLink = (itemId: string, n: number | null): PackLink => {
  const key = n === null ? null : `${itemId}~v${n}`;
  const [result, setResult] = useState<LinkResult | null>(null);

  const renew = useCallback(() => reviewPack(itemId, { kind: 'version', n: n ?? 0 }), [itemId, n]);

  useEffect(() => {
    if (key === null) return undefined;
    let live = true;
    renew().then(
      (link) => { if (live) setResult({ key, link, error: null }); },
      (cause: unknown) => { if (live) setResult({ key, link: null, error: errorMessage(cause) }); },
    );
    return () => { live = false; };
  }, [key, renew]);

  const current = result && result.key === key ? result : null;
  const link = current?.link ?? null;
  const source = useMemo(() => (link ? rangePackSource(link, renew) : null), [link, renew]);

  return { source, error: current?.error ?? null, loading: key !== null && current === null };
};

export { usePackLink };
export type { PackLink };
