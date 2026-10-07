/* @layer store-site @kind hook */
/**
 * The signed link to one pack, fetched once per loader, and the pack as a PackSource read in
 * ranges over it. The loader is also how the link is renewed: when a range read fails
 * because the link lapsed, the source calls it again by itself. A null loader means there is
 * no pack to read, so nothing is fetched. Callers memoize the loader, since a new loader
 * fetches a new link.
 */
import { useEffect, useMemo, useState } from 'react';
import type { PackSource } from '@domains/packs/pack-source.type';
import type { PackLinkResponse } from '@shared/store/api-types';
import { errorMessage } from '@site-kit/api/api-error';
import { rangePackSource } from './range-pack-source';
import type { RenewLink } from './range-pack-source';

type LinkResult = { load: RenewLink; link: PackLinkResponse | null; error: string | null };

type PackLink = {
  source: PackSource | null;
  error: string | null;
  loading: boolean;
};

const usePackLink = (load: RenewLink | null): PackLink => {
  const [result, setResult] = useState<LinkResult | null>(null);

  useEffect(() => {
    if (load === null) return undefined;
    let live = true;
    load().then(
      (link) => { if (live) setResult({ load, link, error: null }); },
      (cause: unknown) => { if (live) setResult({ load, link: null, error: errorMessage(cause) }); },
    );
    return () => { live = false; };
  }, [load]);

  const current = result && load !== null && result.load === load ? result : null;
  const link = current?.link ?? null;
  const source = useMemo(() => (link && load ? rangePackSource(link, load) : null), [link, load]);

  return { source, error: current?.error ?? null, loading: load !== null && current === null };
};

export { usePackLink };
export type { PackLink };
