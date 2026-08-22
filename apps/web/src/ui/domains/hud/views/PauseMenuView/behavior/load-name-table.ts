/* @layer renderer-hud @kind logic */
/**
 * Resolves the name table the running profile should display names from, and
 * caches it at module scope.
 *
 * Two lookups sit behind one call: the profile's chosen language-set id (a
 * profile read) and that set's name table (a set read, which pulls the whole
 * set off disk). Both are memoised per key and kept in module scope rather than
 * component state, so the menu opening or re-rendering never touches storage
 * again — and switching profiles resolves the new one once, then hits the cache
 * on the way back.
 */
import type { NameTable } from '@shared/game/language';
import { listProfiles } from '@app/lib/storage/profile-store';
import { getLanguageSet } from '@app/lib/storage/languages-store';

/** Pending-or-settled reads, so two callers in the same tick share one lookup. */
const languageIdByProfile = new Map<string, Promise<string | null>>();
const tableByLanguageId = new Map<string, Promise<NameTable | null>>();

const readLanguageId = (profileId: string): Promise<string | null> => {
  const cached = languageIdByProfile.get(profileId);
  if (cached) return cached;
  const pending = listProfiles()
    .then((profiles) => profiles.find((profile) => profile.id === profileId)?.language ?? null)
    .catch(() => null);
  languageIdByProfile.set(profileId, pending);
  return pending;
};

const readTable = (languageId: string): Promise<NameTable | null> => {
  const cached = tableByLanguageId.get(languageId);
  if (cached) return cached;
  const pending = getLanguageSet(languageId)
    .then((set) => set?.names ?? null)
    .catch(() => null);
  tableByLanguageId.set(languageId, pending);
  return pending;
};

/**
 * The running profile's name table, or null when there is no profile, no
 * language set selected, or the set cannot be read — every one of which the
 * caller answers with the built-in defaults.
 */
const loadNameTable = async (profileId: string | null): Promise<NameTable | null> => {
  if (!profileId) return null;
  const languageId = await readLanguageId(profileId);
  return languageId ? readTable(languageId) : null;
};

export { loadNameTable };
