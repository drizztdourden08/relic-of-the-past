/* @layer shared-store @kind types */
/**
 * What the app has installed from the store, kept in `store/installed.json` under the Data
 * root and written by the main process. The record is what makes uninstall and update exact:
 * `installedName` is the one thing an installer wrote.
 */
import type { Container, Person, StoreKind } from './types';

/** The listing an install came from, as the download grant named it. */
type InstalledOrigin = { name: string; author: Person; license: string };

type InstalledPack = {
  itemId: string;
  kind: StoreKind;
  /** The version's `n`, compared with the item's liveVersion to offer an update. */
  version: number;
  semver: string;
  container: Container;
  /** The music pack folder, the sprite file name, or the language set id. */
  installedName: string;
  installedAt: number;
  /** A record without one is not valid and is dropped on read. */
  origin: InstalledOrigin;
};

/** The whole file. */
type InstalledRegistry = { version: 1; packs: InstalledPack[] };

export type { InstalledOrigin, InstalledPack, InstalledRegistry };
