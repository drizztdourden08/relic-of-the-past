/* @layer renderer-components @kind hook */
/**
 * The text groups the studio shows, and which one is open. The catalog decides
 * which slots exist; storage only holds what a translator wrote. The record
 * dataset is handed to the builder, not imported by it, because the builder is
 * re-exported from the language barrel the storage layer uses.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { all } from '@shared/game/data';
import { menuTextFor } from '@app/lib/storage/menu-text-store';
import { buildGroups } from '@shared/game/language';
import type { DecodedLine, LanguageSet, TextGroup, TextGroupId } from '@shared/game/language';
import type { DecodedText } from '@app/lib/storage/menu-text-store';

type TextGroupsState = {
  groups: TextGroup[];
  activeGroup: TextGroupId;
  /** The open group's overrides; a missing key means the slot is untranslated. */
  values: Record<string, string>;
  selectGroup: (id: TextGroupId) => void;
  setValue: (key: string, value: string) => void;
};

const NO_LINES: DecodedLine[] = [];
const NO_VALUES: Record<string, string> = {};
const FIRST_GROUP: TextGroupId = 'pause-names';

const useTextGroups = (
  set: LanguageSet | null,
  onChangeValue: (group: TextGroupId, key: string, value: string) => void,
): TextGroupsState => {
  const [activeGroup, setActiveGroup] = useState<TextGroupId>(FIRST_GROUP);
  const [decoded, setDecoded] = useState<DecodedText | null>(null);

  // Read from the player's own file, only when a set is open. A set whose ROM
  // is not stored has nothing to show for these two groups.
  const base = set?.base ?? null;
  useEffect(() => {
    if (base === null) return undefined;
    let live = true;
    setDecoded(null);
    void menuTextFor(base).then((lines) => { if (live) setDecoded(lines); });
    return () => { live = false; };
  }, [base]);

  const menu = decoded?.menu ?? NO_LINES;
  const credits = decoded?.credits ?? NO_LINES;
  // When the stored file is another region's, the slots and sizes are right
  // but the words are not this set's originals, and each row says so.
  const decodedNote = decoded !== null && base !== null && decoded.language !== base
    ? `Shown from the ${decoded.language} file, the only one stored. Not this set's own words.`
    : undefined;

  const groups = useMemo(
    () => buildGroups({ menu, credits, records: all, decodedNote }),
    [menu, credits, decodedNote],
  );

  const values = set?.text?.[activeGroup] ?? NO_VALUES;

  const setValue = useCallback((key: string, value: string) => {
    onChangeValue(activeGroup, key, value);
  }, [activeGroup, onChangeValue]);

  return { groups, activeGroup, values, selectGroup: setActiveGroup, setValue };
};

export { useTextGroups };
export type { TextGroupsState };
