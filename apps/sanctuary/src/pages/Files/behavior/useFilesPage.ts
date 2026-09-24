/* @layer sanctuary-site @kind hook */
/**
 * All of the Files page's state, so the component stays a layout: the list and the scope
 * tab (both shared through the site data, so they outlive the page), the schema, the view
 * (clauses, search, saved views), the owners facet, the selected file, its actions, the
 * uploads and the dialogs a drop leads to. Selection is the route: `/files/:id`. Tabs and
 * upload types follow the caller's rights.
 */
import { useCallback, useMemo } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { navigate } from '../../../router/useLocation';
import { useSessionContext } from '../../../session/session-context';
import { visibleFileTypes } from '../../../session/rights';
import { useSiteData } from '../../../data/site-data-context';
import { toFileRow } from '../../../files/file-row';
import { buildFileSchema } from '../../../files/file-schema';
import { useSurfaceView } from '../../../views/useSurfaceView';
import { useFacet } from '../../../views/useFacet';
import { filterRows } from '../../../views/filter-rows';
import type { FileRow } from '../../../files/file-row';
import { DEFAULT_UPLOAD_TYPE, isFileType } from '../Files.constants';
import { fileScopeTabs, scopePredicate, shownScopeId } from './file-scopes';
import { useFileActions } from './useFileActions';
import { useDropFlow } from './useDropFlow';

const FILES_PATH = '/files';

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
  const view = useSurfaceView('files', schema);
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

  const selected = useMemo(
    () => data.files.find((file) => file.id === selectedId) ?? null,
    [data.files, selectedId],
  );
  const select = useCallback((id: string) => navigate(`${FILES_PATH}/${id}`, { replace: true }), []);
  const deselect = useCallback(() => navigate(FILES_PATH, { replace: true }), []);

  const { upsert, remove } = data;
  const onDeleted = useCallback((id: string) => {
    remove(id);
    deselect();
  }, [remove, deselect]);
  const actions = useFileActions({ onPatched: upsert, onDeleted });
  const drops = useDropFlow({ files: data.files, start: uploads.start });

  const preferred = isFileType(scopeId) ? scopeId : DEFAULT_UPLOAD_TYPE;
  const uploadType = types.includes(preferred) ? preferred : types[0] ?? DEFAULT_UPLOAD_TYPE;

  const canEdit = (file: SanctuaryFile) => isAdmin || file.owner.userId === meId;

  return {
    data,
    scope: { tabs, activeId: scopeId, select: setScopeId, bytes: scopeBytes },
    schema,
    view,
    facets: [owners.facet],
    shown,
    knownTags,
    selected,
    select,
    deselect,
    actions,
    canEdit,
    uploads,
    drops,
    types,
    uploadType,
  };
};

export { useFilesPage };
