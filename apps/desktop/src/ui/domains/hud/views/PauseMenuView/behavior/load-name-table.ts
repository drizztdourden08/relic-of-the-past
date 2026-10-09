/* @layer renderer-hud @kind logic */
import type { NameTable } from '@shared/game/language';
import { listProfiles } from '@app/lib/storage/profile-store';
import { getLanguageSet } from '@app/lib/storage/languages-store';

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

const loadNameTable = async (profileId: string | null): Promise<NameTable | null> => {
  if (!profileId) return null;
  const languageId = await readLanguageId(profileId);
  return languageId ? readTable(languageId) : null;
};

export { loadNameTable };
