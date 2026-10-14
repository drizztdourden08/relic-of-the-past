/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { inputApi } from '@drizztdourden08/brock-input/renderer';

const useDeviceMapping = (guid: string | null | undefined): string | null => {
  const [mapping, setMapping] = useState<string | null>(null);

  useEffect(() => {
    const api = inputApi();
    if (!guid) { setMapping(null); return; }
    let cancelled = false;
    api.mapping.forGuid(guid).then((line) => { if (!cancelled) setMapping(line); }).catch(() => { if (!cancelled) setMapping(null); });
    return () => { cancelled = true; };
  }, [guid]);

  return mapping;
};

export { useDeviceMapping };
