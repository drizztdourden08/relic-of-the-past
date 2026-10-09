/* @layer store-site @kind hook */
import { useEffect, useMemo, useState } from 'react';
import { errorMessage } from '@rotp/hub-client';
import { rangePackSource } from './range-pack-source/range-pack-source';
import type { RenewLink } from './range-pack-source/range-pack-source.type';
import type { LinkResult, PackLink } from './usePackLink.type';

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
export type { PackLink } from './usePackLink.type';
