/* @layer store-site @kind logic */
import type { StoreKind } from '@rotp/hub-contracts';
import { KIND_SECTIONS, STORE_KINDS } from './kinds.constants';

const kindOfSection = (section: string): StoreKind | null =>
  STORE_KINDS.find((kind) => KIND_SECTIONS[kind] === section) ?? null;

export { kindOfSection };
