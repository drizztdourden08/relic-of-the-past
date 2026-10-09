/* @layer sanctuary-site @kind hook */
import { useCallback, useMemo } from 'react';
import type { SanctuaryFile } from '@rotp/hub-contracts';
import { useSessionContext } from '@rotp/design';
import { visibleFileTypes } from '@rotp/hub-contracts';
import { useSiteData } from '../../../data/useSiteData';
import { toFileRow } from '../../../files/file-row';
import { buildFileSchema } from '../../../files/file-schema';
import { useSurfaceView } from '@rotp/design';
import { SANCTUARY_VIEWS } from '../../../views/sanctuary-views.constants';
import { filterRows } from '@rotp/design';
import { DEFAULT_UPLOAD_TYPE } from '../Files.constants';
import { isFileType } from './is-file-type';
import { fileScopeTabs, scopePredicate, shownScopeId } from './file-scopes';
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

  const rows = useMemo(() => data.files.map(toFileRow), [data.files]);
  const schema = useMemo(() => buildFileSchema(rows), [rows]);
  const view = useSurfaceView(SANCTUARY_VIEWS, 'files', schema);
  const inScope = useMemo(() => rows.filter(scopePredicate(scopeId, meId)), [rows, scopeId, meId]);
  const shown = useMemo(
    () => filterRows({ rows: inScope, schema, clauses: view.clauses, search: view.search }),
    [inScope, schema, view.clauses, view.search],
  );

  const tabs = useMemo(() => fileScopeTabs(rows, meId, types), [rows, meId, types]);
  const scopeBytes = useMemo(() => inScope.reduce((sum, row) => sum + row.bytes, 0), [inScope]);
  const knownTags = useMemo(
    () => [...new Set(data.files.flatMap((file) => file.tags))].sort((a, b) => a.localeCompare(b)),
    [data.files],
  );

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
    schema,
    view,
    shown,
    knownTags,
    selected,
    picked,
    pickedIds: selection.ids,
    pick,
    clearPick,
    select,
    deselect,
    actions,
    batch,
    download,
    canEdit,
    drops,
    types,
    uploadType,
  };
};

export { useFilesPage };
