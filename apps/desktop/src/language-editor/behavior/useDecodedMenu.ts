/* @layer renderer-components @kind hook */
import { useEffect, useState } from 'react';
import { menuTextFor } from '@app/storage/menu-text-store';
import type { DecodedText } from '@app/storage/menu-text-store';
import { decodedNoteOf } from './decoded-note-of';
import { NO_LINES } from './text-groups.constants';

const useDecodedMenu = (base: string | null) => {
  const [decoded, setDecoded] = useState<DecodedText | null>(null);

  useEffect(() => {
    if (base === null) return undefined;
    let live = true;
    setDecoded(null);
    void menuTextFor(base).then((lines) => { if (live) setDecoded(lines); });
    return () => { live = false; };
  }, [base]);

  return {
    menu: decoded?.menu ?? NO_LINES,
    credits: decoded?.credits ?? NO_LINES,
    decodedNote: decodedNoteOf(decoded, base),
  };
};

export { useDecodedMenu };
