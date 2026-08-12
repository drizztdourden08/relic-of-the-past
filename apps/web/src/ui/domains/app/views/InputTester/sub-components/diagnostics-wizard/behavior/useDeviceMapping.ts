/* @layer renderer-components @kind hook */
/**
 * The gamecontrollerdb mapping line SDL already has loaded for a device's
 * guid, so the choose-a-controller step can show what the real database
 * (loaded into SDL at startup from resources/gamecontrollerdb.txt) actually
 * knows, instead of a static lookup file this project no longer maintains.
 */
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
