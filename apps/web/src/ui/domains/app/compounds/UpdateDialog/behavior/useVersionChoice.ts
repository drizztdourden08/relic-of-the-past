/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { SelectGroup } from '@ds/primitives/Select';
import type { UpdateState } from '@app/hooks/useAutoUpdate';

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const describe = (version: { size: number; downgrade: boolean; releaseDate: string }): string => {
  const parts = [formatBytes(version.size)];
  if (version.releaseDate) parts.push(new Date(version.releaseDate).toLocaleDateString());
  if (version.downgrade) parts.push('older than installed');
  return parts.filter(Boolean).join(' · ');
};

interface Params {
  open: boolean;
  state: UpdateState;
  loadVersions: () => Promise<void>;
}

/**
 * Owns which version the picker has selected. The list is loaded when the dialog
 * opens rather than up front, and the newest release is preselected so the common
 * case stays one press.
 */
const useVersionChoice = ({ open, state, loadVersions }: Params) => {
  const [selected, setSelected] = useState<string>('');

  useEffect(() => {
    if (open) loadVersions().catch(() => undefined);
  }, [open, loadVersions]);

  useEffect(() => {
    if (!selected && state.info) setSelected(state.info.version);
    else if (!selected && state.versions.length) setSelected(state.versions[0].version);
  }, [selected, state.info, state.versions]);

  // Pre-releases are grouped apart so an unstable build is never picked by accident.
  const groups = useMemo<SelectGroup[]>(() => {
    const stable = state.versions.filter((v) => !v.prerelease);
    const preview = state.versions.filter((v) => v.prerelease);
    const toOption = (v: (typeof state.versions)[number]) => ({
      value: v.version,
      label: v.version,
      description: describe(v),
    });
    return [
      ...(stable.length ? [{ label: 'Releases', options: stable.map(toOption) }] : []),
      ...(preview.length ? [{ label: 'Pre-releases', options: preview.map(toOption) }] : []),
    ];
  }, [state.versions]);

  const chosen = state.versions.find((v) => v.version === selected) ?? null;
  const isLatest = state.versions.length > 0 && state.versions[0].version === selected;

  return { selected, setSelected, groups, chosen, isLatest };
};

export { useVersionChoice };
