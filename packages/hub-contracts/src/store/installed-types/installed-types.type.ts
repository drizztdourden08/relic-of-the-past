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

type InstalledRecordView = {
  itemId: string;
  version: number;
  label: string;
  container: string;
  kind: string | null;
  installedName: string;
  installedAt: number;
  meta: Record<string, unknown>;
};

export type { InstalledOrigin, InstalledPack, InstalledRecordView };
