/* @layer shared-store @kind types */
import type { Container, Person, StoreKind } from '../types';

type InstalledOrigin = { name: string; author: Person; license: string };

type InstalledPack = {
  itemId: string;
  kind: StoreKind;
  version: number;
  semver: string;
  container: Container;
  installedName: string;
  installedAt: number;
  origin: InstalledOrigin;
};

type InstalledRegistry = { version: 1; packs: InstalledPack[] };

export type { InstalledOrigin, InstalledPack, InstalledRegistry };
