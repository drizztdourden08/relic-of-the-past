/* @layer sanctuary-site @kind component */
/**
 * Files: the scope tabs in the header, then the drop zone (the one way in for an
 * upload), the uploads in flight, the FilterBar and the DataTable over the files, with
 * the selected one's detail on the right, and the three dialogs a drop can lead to.
 * Everything stateful lives in useFilesPage.
 */
import { useMemo } from 'react';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DropZone } from '@ds/primitives/DropZone';
import { DataTable } from '@ds/composites/DataTable';
import { FilterBar } from '@ds/composites/FilterBar';
import { LIMITS } from '@shared/sanctuary/limits';
import { SitePage } from '../../layout/SitePage/SitePage';
import { Workbench } from '../../layout/Workbench/Workbench';
import { SavedViewsMenu } from '../../views/SavedViewsMenu';
import { UploadDialog } from '../../components/UploadDialog/UploadDialog';
import { UploadRow } from '../../components/UploadRow/UploadRow';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema';
import { formatBytes } from '../../lib/format-bytes';
import { useFilesPage } from './behavior/useFilesPage';
import { FileDetail } from './sub-components/FileDetail';
import { SameNameDialog } from './sub-components/SameNameDialog';
import { NewVersionDialog } from './sub-components/NewVersionDialog';
import './Files.css';

type FilesProps = {
  /** From the `/files/:id` route; selects that row. */
  selectedId?: string;
};

const COUNT_LABEL = ['file', 'files'] as const;
const SEARCH_PLACEHOLDER = 'Search files...';
const DROP_HINT = `up to ${formatBytes(LIMITS.fileBytes)} each, stored exactly as sent`;

const Files = (props: FilesProps) => {
  const { selectedId = null } = props;
  const page = useFilesPage(selectedId);
  const { data, scope, view, uploads, drops, selected } = page;
  const headerTabs = useMemo(
    () => ({ items: scope.tabs, activeId: scope.activeId, onSelect: scope.select }),
    [scope.tabs, scope.activeId, scope.select],
  );

  const toolbar = (
    <>
      <FilterBar
        schema={page.schema}
        clauses={view.clauses}
        onChange={view.setClauses}
        search={view.search}
        onSearchChange={view.setSearch}
        searchPlaceholder={SEARCH_PLACEHOLDER}
        searchLabel="Search files"
        facets={page.facets}
      />
      <SavedViewsMenu state={view.savedViews} />
    </>
  );

  const table = (
    <DataTable
      rows={page.shown}
      schema={page.schema}
      getRowId={fileRowId}
      viewKey={view.tableKey}
      viewStorage={view.storage}
      fallbackColumns={FILE_DEFAULT_COLUMNS}
      selectedId={selectedId}
      onSelect={page.select}
      countLabel={COUNT_LABEL}
      emptyMessage={data.loading ? 'Loading files...' : 'No file matches.'}
    />
  );

  const detail = selected && (
    <FileDetail
      key={selected.id}
      file={selected}
      knownTags={page.knownTags}
      types={page.types}
      canEdit={page.canEdit(selected)}
      canDelete={page.canEdit(selected)}
      actions={page.actions}
      onDropVersion={drops.dropOnFile}
      onClose={page.deselect}
    />
  );
  const canUpload = page.types.length > 0;

  return (
    <>
      <SitePage section="files" tabs={headerTabs} scroll={false}>
        <Stack gap="md" align="stretch" className="files">
          <Text as="span" variant="caption" className="files__summary">
            {page.shown.length === 1 ? '1 file' : `${page.shown.length} files`} · {formatBytes(scope.bytes)}
          </Text>
          {canUpload && <DropZone label="drop files here" hint={DROP_HINT} onDrop={drops.drop} />}
          {uploads.jobs.length > 0 && (
            <Stack gap="xs" align="stretch" className="files__uploads">
              {uploads.jobs.map((job) => <UploadRow key={job.id} job={job} onDismiss={uploads.dismiss} />)}
            </Stack>
          )}
          {data.error && <Text as="p" variant="caption" role="alert">{data.error}</Text>}
          <Workbench toolbar={toolbar} table={table} detail={detail} />
        </Stack>
      </SitePage>
      <SameNameDialog question={drops.asking} onSeparate={drops.separate} onVersion={drops.version} onClose={drops.skip} />
      <NewVersionDialog request={drops.request} onConfirm={drops.confirmVersion} onCancel={drops.cancelVersion} />
      <UploadDialog
        files={drops.upload}
        types={page.types}
        defaultType={page.uploadType}
        knownTags={page.knownTags}
        onConfirm={drops.confirmUpload}
        onCancel={drops.cancelUpload}
      />
    </>
  );
};

export { Files };
export type { FilesProps };
