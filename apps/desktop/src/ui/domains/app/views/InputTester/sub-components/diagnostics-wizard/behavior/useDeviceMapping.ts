/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { mappingForGuid } from '@app/lib/input/native-capture-store';

const useDeviceMapping = (guid: string | null | undefined): string | null => {
  const [mapping, setMapping] = useState<string | null>(null);

  useEffect(() => {
    if (!guid) { setMapping(null); return; }
    let cancelled = false;
    mappingForGuid(guid).then((line) => { if (!cancelled) setMapping(line); }).catch(() => { if (!cancelled) setMapping(null); });
    return () => { cancelled = true; };
  }, [guid]);

  return mapping;
};

export { useDeviceMapping };
