/* @layer sanctuary-site @kind hook */
import { useCallback, useMemo } from 'react';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { useSessionContext } from '@rotp/design';
import { visibleFileTypes } from '@rotp/hub-contracts';
import { useSiteData } from '../../../data/useSiteData';
import { DEFAULT_UPLOAD_TYPE } from '../Files.constants';
import { isFileType } from './is-file-type';
import { shownScopeId } from './shown-scope-id';
import { useFileRows } from './useFileRows';
import { useBatchActions } from './useBatchActions';
import { useBatchDownload } from './useBatchDownload';
import { useFileActions } from './useFileActions';
import { useFileSelection } from './useFileSelection';
import { useDropFlow } from './useDropFlow';

const useFilesPage = (selectedId: string | null) => {
  const { me, access, rights } = useSessionContext();
  const meId = me?.id ?? '';
  const isAdmin = access?.state === 'admin';
  const types = useMemo(() => visibleFileTypes(rights), [rights]);

  const { files: data, uploads, scopes, setScope } = useSiteData();
  const scopeId = shownScopeId(scopes.files, types);
  const setScopeId = useCallback((id: string) => setScope('files', id), [setScope]);

  const { schema, view, shown, tabs, scopeBytes, knownTags } = useFileRows(data.files, scopeId, meId, types);

  const selection = useFileSelection(selectedId);
  const picked = useMemo(() => data.files.filter((file) => selection.ids.has(file.id)), [data.files, selection.ids]);
  const selected = picked.length === 1 ? picked[0] : null;
  const { select, change, clear: deselect, forget } = selection;

  const selectScope = useCallback((id: string) => {
    deselect();
    setScopeId(id);
  }, [deselect, setScopeId]);

  const { upsert, remove } = data;
  const onDeleted = useCallback((id: string) => {
    remove(id);
    deselect();
  }, [remove, deselect]);
  const onBatchDeleted = useCallback((id: string) => {
    remove(id);
    forget(id);
  }, [remove, forget]);
  const actions = useFileActions({ onPatched: upsert, onDeleted });

  const canEdit = useCallback((file: SanctuaryFile) => isAdmin || file.owner.userId === meId, [isAdmin, meId]);
  const batch = useBatchActions({ canEdit, onPatched: upsert, onDeleted: onBatchDeleted });
  const download = useBatchDownload();
  const { dismiss } = batch;
  const pick = useCallback((ids: ReadonlySet<string>) => {
    dismiss();
    change(ids);
  }, [dismiss, change]);
  const clearPick = useCallback(() => pick(new Set()), [pick]);
  const drops = useDropFlow({ files: data.files, start: uploads.start });

  const preferred = isFileType(scopeId) ? scopeId : DEFAULT_UPLOAD_TYPE;
  const uploadType = types.includes(preferred) ? preferred : types[0] ?? DEFAULT_UPLOAD_TYPE;

  return {
    data,
    scope: { tabs, activeId: scopeId, select: selectScope, bytes: scopeBytes },
    schema, view, shown, knownTags,
    selected, picked, pickedIds: selection.ids, pick, clearPick, select, deselect,
    actions, batch, download, canEdit, drops, types, uploadType,
  };
};

export { useFilesPage };
