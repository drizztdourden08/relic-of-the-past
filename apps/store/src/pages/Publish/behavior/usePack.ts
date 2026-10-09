/* @layer store-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { CONTAINER_KIND, isContainer } from '@rotp/hub-contracts';
import { STORE_LIMITS } from '@rotp/hub-contracts';
import type { StoreKind } from '@rotp/hub-contracts';
import { formatBytes } from '@rotp/hub-client';
import { KIND_LABELS } from '../../../lib/kinds';
import type { PackCheck } from './usePack.type';

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

const usePack = (required: StoreKind | null) => {
  const [file, setFile] = useState<File | null>(null);
  const check = useMemo(() => checkPack(file, required), [file, required]);
  const drop = useCallback((files: File[]) => setFile(files[0] ?? null), []);
  const clear = useCallback(() => setFile(null), []);
  return { file, ...check, drop, clear };
};

export { usePack };
