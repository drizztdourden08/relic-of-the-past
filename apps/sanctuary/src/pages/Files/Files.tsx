/* @layer sanctuary-site @kind component */
import { useMemo } from 'react';
import { Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { DataTable, FilterBar, SettingsPage } from '@drizztdourden08/tessera/composites';
import { SavedViewsMenu, useSectionHeading } from '@rotp/design';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema.constants';
import { formatBytes } from '@rotp/hub-client';
import { useFilesPage } from './behavior/useFilesPage';
import { FilesAside } from './sub-components/FilesAside';
import { FileDropDialogs } from './sub-components/FileDropDialogs';
import { UploadActions } from './sub-components/UploadActions';
import { COUNT_LABEL, SEARCH_PLACEHOLDER } from './Files.constants';
import type { FilesProps } from './Files.type';
import './Files.css';

const Files = (props: FilesProps) => {
  const { selectedId = null } = props;
  const page = useFilesPage(selectedId);
  const heading = useSectionHeading('files');
  const { data, scope, view, drops } = page;
  const headerTabs = useMemo(
    () => ({ items: scope.tabs, activeId: scope.activeId, onSelect: scope.select }),
    [scope.tabs, scope.activeId, scope.select],
  );

  const toolbar = (
    <FilterBar
      schema={page.schema}
      clauses={view.clauses}
      onChange={view.setClauses}
      search={view.search}
      onSearchChange={view.setSearch}
      searchPlaceholder={SEARCH_PLACEHOLDER}
      searchLabel="Search files"
      extra={<SavedViewsMenu state={view.savedViews} />}
    />
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

  return (
    <>
      <Flex gap="md" align="stretch" className="files">
        <SettingsPage icon={heading.icon} title={heading.title} tabs={headerTabs} scroll={false} actions={headerActions} className="files__page">
          <Stack gap="md" align="stretch" className="files__body">
            <Text as="span" variant="caption" className="files__summary">
              {page.shown.length === 1 ? '1 file' : `${page.shown.length} files`} · {formatBytes(scope.bytes)}
            </Text>
            {data.error && <Text as="p" variant="caption" role="alert">{data.error}</Text>}
            {toolbar}
            {table}
          </Stack>
        </SettingsPage>
        <FilesAside page={page} />
      </Flex>
      <FileDropDialogs page={page} />
    </>
  );
};

export { Files };
