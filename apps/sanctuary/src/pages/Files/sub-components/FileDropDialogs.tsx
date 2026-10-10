/* @layer sanctuary-site @kind component */
import { UploadDialog } from '../../../components/UploadDialog/UploadDialog';
import { SameNameDialog } from './SameNameDialog';
import { VersionUploadDialog } from './VersionUploadDialog';
import type { FilesAsideProps } from './FilesAside.type';

const FileDropDialogs = (props: FilesAsideProps) => {
  const { page } = props;
  const { drops } = page;
  return (
    <>
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

export { FileDropDialogs };
