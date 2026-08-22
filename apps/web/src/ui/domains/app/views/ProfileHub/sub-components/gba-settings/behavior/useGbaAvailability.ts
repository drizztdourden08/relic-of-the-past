/* @layer renderer-components @kind hook */
/** Whether a Game Boy Advance supplement cartridge has been imported, so the Extra
  * Dungeon toggle knows whether it has anything to gate. */
import { useEffect, useState } from 'react';
import { listSupplements } from '@app/lib/storage/roms-store';

interface GbaAvailability {
  hasSupplement: boolean;
  supplementFile: string | null;
}

const NONE: GbaAvailability = { hasSupplement: false, supplementFile: null };

const useGbaAvailability = (): GbaAvailability => {
  const [availability, setAvailability] = useState<GbaAvailability>(NONE);

  useEffect(() => {
    let cancelled = false;

    listSupplements().then((supplements) => {
      if (cancelled) return;
      const [first] = supplements;
      setAvailability(first ? { hasSupplement: true, supplementFile: first.romFile } : NONE);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return availability;
};

export { useGbaAvailability };
export type { GbaAvailability };
