/* @layer shared-store @kind constants */
import { MSUL_MANIFEST_NAME } from '@shared/types/msu-manifest';
import { MANIFEST_ENTRY } from '@shared/storage/link-sprites/rsp.type';
import { SET_FILES } from '@shared/storage/languages/paths';
import type { Container, StoreKind } from '../types';

const CONTAINERS: readonly Container[] = ['msul', 'rsp', 'rlang'];

const CONTAINER_KIND: Record<Container, StoreKind> = { msul: 'music', rsp: 'character', rlang: 'language' };

const KIND_CONTAINER: Record<StoreKind, Container> = { music: 'msul', character: 'rsp', language: 'rlang' };

const CONTAINER_MANIFEST: Record<Container, string> = {
  msul: MSUL_MANIFEST_NAME,
  rsp: MANIFEST_ENTRY,
  rlang: SET_FILES.meta,
};

export { CONTAINERS, CONTAINER_KIND, KIND_CONTAINER, CONTAINER_MANIFEST };
