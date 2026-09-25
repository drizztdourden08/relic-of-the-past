/* @layer sanctuary-site @kind component */
/**
 * The media block of an image or video file's details: the preview of its current
 * version, and the viewer once it is expanded. The link is fetched again when the file or
 * its current version changes.
 */
import { useState } from 'react';
import type { SanctuaryFile } from '@shared/sanctuary/file-types';
import { MediaPreview } from '../../../components/MediaPreview/MediaPreview';
import { MediaViewer } from '../../../components/MediaViewer/MediaViewer';
import { useFilePreview } from '../../../files/useFilePreview';
import type { MediaKind } from '../../../files/media-kind';

type FileMediaProps = {
  file: SanctuaryFile;
  kind: MediaKind;
};

const FileMedia = (props: FileMediaProps) => {
  const { file, kind } = props;
  const { url, error } = useFilePreview(file.id, file.currentVersion);
  /** The second the viewer opens at; null while it is closed. */
  const [viewerAt, setViewerAt] = useState<number | null>(null);

  return (
    <>
      <MediaPreview kind={kind} src={url} name={file.name} error={error} onExpand={setViewerAt} />
      {url && viewerAt !== null && (
        <MediaViewer kind={kind} src={url} name={file.name} startAt={viewerAt} onClose={() => setViewerAt(null)} />
      )}
    </>
  );
};

export { FileMedia };
export type { FileMediaProps };
