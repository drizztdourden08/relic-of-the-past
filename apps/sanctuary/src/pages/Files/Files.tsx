/* @layer sanctuary-site @kind component */
import { useMemo } from 'react';
import { Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar } from '@drizztdourden08/tessera/composites';
import { SitePage } from '@site-kit/layout/SitePage/SitePage';
import { SideColumn } from '@site-kit/layout/SideColumn/SideColumn';
import { Workbench } from '@site-kit/layout/Workbench/Workbench';
import { SavedViewsMenu } from '@site-kit/views/SavedViewsMenu';
import { UploadDialog } from '../../components/UploadDialog/UploadDialog';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema.constants';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { useFilesPage } from './behavior/useFilesPage';
import { FileDetail } from './sub-components/FileDetail';
import { SameNameDialog } from './sub-components/SameNameDialog';
import { VersionUploadDialog } from './sub-components/VersionUploadDialog';
import { UploadActions } from './sub-components/UploadActions';
import { SelectionPanel } from './sub-components/SelectionPanel';
import { COUNT_LABEL, SEARCH_PLACEHOLDER } from './Files.constants';
import type { FilesProps } from './Files.type';
import './Files.css';

const Files = (props: FilesProps) => {
  const { selectedId = null } = props;
  const page = useFilesPage(selectedId);
  const { data, scope, view, drops, selected } = page;
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
      selectable
      selectedId={selectedId}
      selectedIds={page.pickedIds}
      onSelect={page.select}
      onSelectionChange={page.pick}
      countLabel={COUNT_LABEL}
      emptyMessage={data.loading ? 'Loading files...' : 'No file matches.'}
    />
  );

  const headerActions = (
    <UploadActions canUpload={page.types.length > 0} onDrop={drops.drop} />
  );

  const several = page.picked.length > 1;
  const aside = (selected || several) && (
    <SideColumn>
      {several && (
        <SelectionPanel
          files={page.picked}
          types={page.types}
          knownTags={page.knownTags}
          canEdit={page.canEdit}
          batch={page.batch}
          download={page.download}
          onClear={page.clearPick}
        />
      )}
      {selected && (
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
      )}
    </SideColumn>
  );

  return (
    <>
      <SitePage section="files" tabs={headerTabs} scroll={false} actions={headerActions} aside={aside}>
        <Stack gap="md" align="stretch" className="files">
          <Text as="span" variant="caption" className="files__summary">
            {page.shown.length === 1 ? '1 file' : `${page.shown.length} files`} · {formatBytes(scope.bytes)}
          </Text>
          {data.error && <Text as="p" variant="caption" role="alert">{data.error}</Text>}
          <Workbench toolbar={toolbar} table={table} detail={null} />
        </Stack>
      </SitePage>
      <SameNameDialog question={drops.asking} onSeparate={drops.separate} onVersion={drops.version} onClose={drops.skip} />
      <VersionUploadDialog request={drops.request} onConfirm={drops.confirmVersion} onCancel={drops.cancelVersion} />
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
