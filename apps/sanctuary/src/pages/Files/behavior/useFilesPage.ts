/* @layer sanctuary-site @kind hook */
/**
 * All of the Files page's state, so the component stays a layout: the list and the scope
 * tab (both shared through the site data, so they outlive the page), the schema, the view
 * (clauses, search, saved views), the owners facet, the picked files with the actions on
 * one of them or on several, and the dialogs a drop leads to (a confirmed drop joins the
 * site's upload queue, shown in the tray). One picked file is the route, `/files/:id`; a
 * new tab clears the pick. Tabs and upload types follow the caller's rights.
 */
import { useCallback, useMemo } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { useSessionContext } from '@site-kit/session/session-context';
import { visibleFileTypes } from '@shared/sanctuary/sanctuary-rights';
import { useSiteData } from '../../../data/site-data-context';
import { toFileRow } from '../../../files/file-row';
import { buildFileSchema } from '../../../files/file-schema';
import { useSurfaceView } from '@site-kit/views/useSurfaceView';
import { SANCTUARY_VIEWS } from '../../../views/sanctuary-views';
import { useFacet } from '@site-kit/views/useFacet';
import { filterRows } from '@site-kit/views/filter-rows';
import type { FileRow } from '../../../files/file-row';
import { DEFAULT_UPLOAD_TYPE, isFileType } from '../Files.constants';
import { fileScopeTabs, scopePredicate, shownScopeId } from './file-scopes';
import { useBatchActions } from './useBatchActions';
import { useBatchDownload } from './useBatchDownload';
import { useFileActions } from './useFileActions';
import { useFileSelection } from './useFileSelection';
import { useDropFlow } from './useDropFlow';

const ownerOf = (row: FileRow) => row.owner.displayName;

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
  const owners = useFacet({ id: 'owners', label: 'Show owners', rows, valueOf: ownerOf });

  const inScope = useMemo(() => rows.filter(scopePredicate(scopeId, meId)), [rows, scopeId, meId]);
  const shown = useMemo(
    () => owners.apply(filterRows({ rows: inScope, schema, clauses: view.clauses, search: view.search })),
    [owners, inScope, schema, view.clauses, view.search],
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

  /** A new tab starts with nothing picked. */
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
  /** A pick made in the table or cleared from the panel; the last batch report goes with the old pick. */
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
    facets: [owners.facet],
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
