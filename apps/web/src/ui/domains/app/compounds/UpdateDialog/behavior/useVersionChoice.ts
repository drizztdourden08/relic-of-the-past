/* @layer renderer-components @kind hook */
import { useEffect, useMemo, useState } from 'react';
import type { SelectGroup } from '@ds/primitives/Select';
import type { UpdateState } from '@app/hooks/useAutoUpdate';

/** What pressing the button would do, which is not always "update". */
type UpdateAction = 'update' | 'reinstall' | 'downgrade';

const ACTION_LABELS: Record<UpdateAction, string> = {
  update: 'Update',
  reinstall: 'Reinstall',
  downgrade: 'Downgrade',
};

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * The download, not the package. A forward step is usually a small delta, so showing
 * the package size made a routine update look like a fresh install.
 */
const describe = (version: {
  downloadSize: number;
  releaseDate: string;
  downgrade: boolean;
  installed: boolean;
  prerelease: boolean;
}): string => {
  const parts = [formatBytes(version.downloadSize)];
  if (version.releaseDate) parts.push(new Date(version.releaseDate).toLocaleDateString());
  if (version.installed) parts.push('installed');
  else if (version.downgrade) parts.push('older than installed');
  if (version.prerelease) parts.push('pre-release');
  return parts.filter(Boolean).join(' · ');
};

const actionFor = (chosen: { downgrade: boolean; installed: boolean } | null): UpdateAction => {
  if (chosen?.installed) return 'reinstall';
  if (chosen?.downgrade) return 'downgrade';
  return 'update';
};

interface Params {
  open: boolean;
  state: UpdateState;
  loadVersions: () => Promise<void>;
}

/**
 * Owns which version the picker has selected. The list is loaded when the dialog
 * opens, not up front, and the newest release is preselected so the common
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

  // One list, newest first, with pre-releases marked in the row instead of split into
  // their own section: the toggle above already says whether they are being offered,
  // and a selected pre-release warns for itself.
  const groups = useMemo<SelectGroup[]>(() => {
    if (!state.versions.length) return [];
    return [{
      label: 'Releases',
      options: state.versions.map((v) => ({ value: v.version, label: v.version, description: describe(v) })),
    }];
  }, [state.versions]);

  const chosen = state.versions.find((v) => v.version === selected) ?? null;
  const isLatest = state.versions.length > 0 && state.versions[0].version === selected;
  const action = actionFor(chosen);

  return { selected, setSelected, groups, chosen, isLatest, action, actionLabel: ACTION_LABELS[action] };
};

export { useVersionChoice };
export type { UpdateAction };
