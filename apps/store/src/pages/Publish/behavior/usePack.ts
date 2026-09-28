/* @layer store-site @kind hook */
/**
 * The pack field: the one file dropped or picked, what kind it is by its extension, and why
 * it cannot be sent if it cannot: a file the store does not carry, the wrong kind for the
 * item, or larger than the kind's cap.
 */
import { useCallback, useMemo, useState } from 'react';
import { CONTAINER_KIND, isContainer } from '@shared/store/containers';
import { STORE_LIMITS } from '@shared/store/limits';
import type { Container, StoreKind } from '@shared/store/types';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { KIND_LABELS } from '../../../lib/kinds';

type PackCheck = { container: Container | null; kind: StoreKind | null; problem: string | null };

const extensionOf = (name: string) => name.slice(name.lastIndexOf('.') + 1).toLowerCase();

const checkPack = (file: File | null, required: StoreKind | null): PackCheck => {
  if (!file) return { container: null, kind: null, problem: null };
  const ext = extensionOf(file.name);
  if (!isContainer(ext)) return { container: null, kind: null, problem: `"${file.name}" is not a pack. Drop a .msul, .rsp or .rlang file.` };
  const kind = CONTAINER_KIND[ext];
  if (required && kind !== required) return { container: ext, kind, problem: `This file is a ${KIND_LABELS[kind]} pack. Drop a ${KIND_LABELS[required]} pack for this item.` };
  const cap = STORE_LIMITS.packBytes[kind];
  if (file.size > cap) return { container: ext, kind, problem: `This pack is ${formatBytes(file.size)}. A ${KIND_LABELS[kind]} pack is at most ${formatBytes(cap)}.` };
  return { container: ext, kind, problem: null };
};

/** `required` is the item's kind when adding a version; null for a new item. */
const usePack = (required: StoreKind | null) => {
  const [file, setFile] = useState<File | null>(null);
  const check = useMemo(() => checkPack(file, required), [file, required]);
  const drop = useCallback((files: File[]) => setFile(files[0] ?? null), []);
  const clear = useCallback(() => setFile(null), []);
  return { file, ...check, drop, clear };
};

type PackState = ReturnType<typeof usePack>;

export { usePack };
export type { PackState };
