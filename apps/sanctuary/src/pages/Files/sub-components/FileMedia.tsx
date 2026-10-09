/* @layer sanctuary-site @kind component */
import { useState } from 'react';
import { MediaPreview } from '@site-kit/components/MediaPreview/MediaPreview';
import { MediaViewer } from '@site-kit/components/MediaViewer/MediaViewer';
import { useFilePreview } from '../../../files/useFilePreview';
import type { FileMediaProps } from './FileMedia.type';

const FileMedia = (props: FileMediaProps) => {
  const { file, kind } = props;
  const { url, error } = useFilePreview(file.id, file.currentVersion);
  const [viewerOpenAtSecond, setViewerOpenAtSecond] = useState<number | null>(null);

  return (
    <>
      <MediaPreview kind={kind} src={url} name={file.name} error={error} onExpand={setViewerOpenAtSecond} />
      {url && viewerOpenAtSecond !== null && (
        <MediaViewer kind={kind} src={url} name={file.name} startAt={viewerOpenAtSecond} onClose={() => setViewerOpenAtSecond(null)} />
      )}
    </>
  );
};

export { FileMedia };
