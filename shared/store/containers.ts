/* @layer shared-store @kind constants */
/**
 * The three containers the store carries, one per kind, and the manifest each keeps as its
 * first archive entry so the API and the app can identify a pack from the head of the file.
 */
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { MANIFEST_ENTRY } from '@shared/storage/link-sprites/rsp.type';
import { SET_FILES } from '@shared/storage/languages/paths';
import type { Container, StoreKind } from './types';

const CONTAINERS: readonly Container[] = ['msul', 'rsp', 'rlang'];

const CONTAINER_KIND: Record<Container, StoreKind> = { msul: 'music', rsp: 'character', rlang: 'language' };

const KIND_CONTAINER: Record<StoreKind, Container> = { music: 'msul', character: 'rsp', language: 'rlang' };

/** The name entry 0 must carry. */
const CONTAINER_MANIFEST: Record<Container, string> = {
  msul: MSUL_MANIFEST_NAME,
  rsp: MANIFEST_ENTRY,
  rlang: SET_FILES.meta,
};

const isContainer = (value: unknown): value is Container => CONTAINERS.includes(value as Container);

export { CONTAINERS, CONTAINER_KIND, KIND_CONTAINER, CONTAINER_MANIFEST, isContainer };
