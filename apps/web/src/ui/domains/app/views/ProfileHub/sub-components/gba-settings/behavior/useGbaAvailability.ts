/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { listSupplements } from '@app/lib/storage/roms-store';
import { NO_SUPPLEMENT } from '../gba-settings.constants';
import type { GbaAvailability } from '../gba-settings.type';

const useGbaAvailability = (): GbaAvailability => {
  const [availability, setAvailability] = useState<GbaAvailability>(NO_SUPPLEMENT);

  useEffect(() => {
    let cancelled = false;

    listSupplements().then((supplements) => {
      if (cancelled) return;
      const [first] = supplements;
      setAvailability(first ? { hasSupplement: true, supplementFile: first.romFile } : NO_SUPPLEMENT);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return availability;
};

export { useGbaAvailability };
export type { GbaAvailability };
