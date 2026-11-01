/* @layer sanctuary-site @kind component */
import { DataTable } from '@drizztdourden08/tessera/composites';
import { fileRowId } from '../../files/file-row';
import { FILE_DEFAULT_COLUMNS } from '../../files/file-schema.constants';
import { formatBytes } from '@rotp/hub-client';
import { TablePage } from '../../components/TablePage';
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
  const { data, scope, view, drops } = page;

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

  return (
    <>
      <TablePage
        section="files"
        scope={scope}
        actions={<UploadActions canUpload={page.types.length > 0} onDrop={drops.drop} />}
        summary={`${page.shown.length === 1 ? '1 file' : `${page.shown.length} files`} · ${formatBytes(scope.bytes)}`}
        error={data.error}
        filter={{ schema: page.schema, view, placeholder: SEARCH_PLACEHOLDER, label: 'Search files' }}
        table={table}
        aside={<FilesAside page={page} />}
      />
      <FileDropDialogs page={page} />
    </>
  );
};

export { Files };
