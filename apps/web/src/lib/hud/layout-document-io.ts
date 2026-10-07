/* @layer renderer-lib @kind logic */
/**
 * The player's own HUD layouts, in the document format, read through the SAME
 * loader the built-ins are read through.
 *
 * There is one reader (`loadLayout`), one validator and one type. A layout
 * saved by the editor and a layout shipped in `shared/hud/layouts/built-in/`
 * differ by the `builtIn` flag and by nothing else - no code path, no shape, no
 * second set of defaults - which is the property phase 2 of
 * `plans/hud-layout-engine.html` exists to establish. Anything a built-in can
 * express, a player's layout can express, because it is the same file read the
 * same way.
 *
 * A STORED DOCUMENT THAT DOES NOT VALIDATE IS REFUSED, NOT REPAIRED. It is
 * dropped from the list instead of half-loaded, and every reason is kept in
 * `problems` so a screen can say which layout is broken and why. Silently
 * fixing a file the player edited would be guessing at what they meant; drawing
 * two thirds of it would be worse.
 *
 * `layout-store-io.ts`, which served the flat five-placement format, is gone:
 * phase 3 switched the renderer to the tree, so there is one stored format and
 * one route to it again.
 */
import { getPlatform } from '@app/platform/get-platform';
import { readJson, writeJson } from '@shared/storage/json';
import { newId } from '@shared/storage/id';
import { BUILT_IN_LAYOUTS, DEFAULT_LAYOUT, layoutById, tryLoadLayout } from '@shared/hud/layouts';
import { activeProfileId } from './active-profile';
import type { HudLayout } from '@shared/types/hud';

const files = () => getPlatform().files;

/** One file per profile. It is deliberately NOT the flat format's old
 *  `hud-layouts.json`: nothing had shipped, so there is nothing to migrate, and
 *  a stale file from a pre-tree build is left alone, not half-read. */
const documentsPath = (profileId: string): string => `profiles/${profileId}/hud-documents.json`;

interface StoredLayouts {
  documents: HudLayout[];
  /** One entry per stored layout that would not load: what it called itself,
   *  and every line of it that was wrong. */
  problems: { id: string; errors: string[] }[];
}

const EMPTY: StoredLayouts = { documents: [], problems: [] };

const nameOf = (value: unknown, index: number): string => {
  const id = (value as { id?: unknown } | null)?.id;
  return typeof id === 'string' && id ? id : `#${index}`;
};

/** Everything the profile holds, sorted into what loaded and what did not. */
const readCustomLayouts = async (): Promise<StoredLayouts> => {
  const profileId = await activeProfileId();
  if (!profileId) return EMPTY;
  const stored = await readJson<unknown[]>(files(), documentsPath(profileId), []);
  if (!Array.isArray(stored)) return EMPTY;
  const result: StoredLayouts = { documents: [], problems: [] };
  stored.forEach((entry, index) => {
    const loaded = tryLoadLayout(entry);
    if (loaded.ok) result.documents.push(loaded.doc);
    else result.problems.push({ id: nameOf(entry, index), errors: loaded.errors });
  });
  return result;
};

/**
 * Write the list back, refusing anything that would not load again.
 *
 * A layout is validated on the way OUT and on the way in, because the
 * editor holds a draft in memory and a draft is not a document until it passes
 * - and a file that cannot be read back is worse than a save that was declined.
 */
const writeCustomLayouts = async (documents: readonly HudLayout[]): Promise<void> => {
  const profileId = await activeProfileId();
  if (!profileId) return;
  const checked = documents.map((doc) => {
    const loaded = tryLoadLayout(doc);
    if (!loaded.ok) throw new Error(`'${doc.id}' cannot be saved:\n  - ${loaded.errors.join('\n  - ')}`);
    return loaded.doc;
  });
  await writeJson(files(), documentsPath(profileId), checked);
};

/** Upsert by id, so saving an already-saved layout replaces it instead of
 *  growing a second entry the picker cannot tell apart. */
const saveCustomLayout = async (doc: HudLayout): Promise<HudLayout> => {
  const saved: HudLayout = { ...doc, builtIn: false };
  const { documents } = await readCustomLayouts();
  const index = documents.findIndex((existing) => existing.id === saved.id);
  await writeCustomLayouts(index >= 0
    ? documents.map((existing, at) => (at === index ? saved : existing))
    : [...documents, saved]);
  return saved;
};

const deleteCustomLayout = async (id: string): Promise<void> => {
  const { documents } = await readCustomLayouts();
  await writeCustomLayouts(documents.filter((doc) => doc.id !== id));
};

/**
 * A new layout that starts life as a copy of another. The source keeps its own
 * id, so forking a built-in never shadows the shipped one and forking a custom
 * layout never overwrites it; `basedOn` remembers where it came from, which is
 * what the editor's "start from" list reads.
 */
const forkLayout = (source: HudLayout, name: string): HudLayout => ({
  ...structuredClone(source),
  id: `custom-${newId()}`,
  name: name.trim() || `${source.name} copy`,
  builtIn: false,
  basedOn: source.basedOn ?? source.id,
});

/** Built-ins first, then the player's own - the order the pickers show. */
const listLayouts = async (): Promise<HudLayout[]> => [
  ...BUILT_IN_LAYOUTS,
  ...(await readCustomLayouts()).documents,
];

/**
 * An id to a document, custom included. An unknown id answers the shipped
 * default instead of nothing: a stale id in a settings file is a far likelier
 * cause than a real request for no interface at all. A stored layout that
 * failed to load is not "unknown" - it is in `problems`, and the caller that
 * wants to tell the player so reads `readCustomLayouts`.
 */
const resolveStoredLayout = async (id: string): Promise<HudLayout> => {
  const builtIn = layoutById(id);
  if (builtIn) return builtIn;
  const { documents } = await readCustomLayouts();
  return documents.find((doc) => doc.id === id) ?? DEFAULT_LAYOUT;
};

export {
  deleteCustomLayout, forkLayout, listLayouts, readCustomLayouts, resolveStoredLayout,
  saveCustomLayout, writeCustomLayouts,
};
export type { StoredLayouts };
