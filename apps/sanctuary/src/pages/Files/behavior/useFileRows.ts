/* @layer sanctuary-site @kind hook */
import { useMemo } from 'react';
import type { FileType, SanctuaryFile } from '@rotp/hub-contracts';
import { useSurfaceView, filterRows } from '@rotp/design';
import { toFileRow } from '../../../files/file-row';
import { buildFileSchema } from '../../../files/file-schema';
import { SANCTUARY_VIEWS } from '../../../views/sanctuary-views.constants';
import { fileScopeTabs } from './file-scope-tabs';
import { scopePredicate } from './scope-predicate';

const useFileRows = (files: readonly SanctuaryFile[], scopeId: string, meId: string, types: readonly FileType[]) => {
  const rows = useMemo(() => files.map(toFileRow), [files]);
  const schema = useMemo(() => buildFileSchema(rows), [rows]);
  const view = useSurfaceView(SANCTUARY_VIEWS, 'files', schema);
  const inScope = useMemo(() => rows.filter(scopePredicate(scopeId, meId)), [rows, scopeId, meId]);
  const shown = useMemo(
    () => filterRows({ rows: inScope, schema, clauses: view.clauses, search: view.search }),
    [inScope, schema, view.clauses, view.search],
  );
  const tabs = useMemo(() => fileScopeTabs(rows, meId, types), [rows, meId, types]);
  const scopeBytes = useMemo(() => inScope.reduce((sum, row) => sum + row.bytes, 0), [inScope]);
  const knownTags = useMemo(() => [...new Set(files.flatMap((file) => file.tags))].sort((a, b) => a.localeCompare(b)), [files]);
  return { schema, view, shown, tabs, scopeBytes, knownTags };
};

export { useFileRows };
