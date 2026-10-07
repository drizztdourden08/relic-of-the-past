/* @layer site-kit @kind component */
/**
 * A site's uploads on every page: the tray and the dialog over whatever page is open, the
 * jobs a reload cut off brought back once, and the prompt before leaving mid-upload.
 * Mounted once, in the site's member data provider.
 */
import { useEffect } from 'react';
import { UploadProgressDialog } from '../UploadProgressDialog';
import { UploadTray } from '../UploadTray';
import { useLeaveGuard } from '../../upload/useLeaveGuard';
import { useUploadQueue } from '../../upload/useUploadQueue';
import type { UploadLayerProps } from './UploadLayer.type';

const UploadLayer = (props: UploadLayerProps) => {
  const { queue } = props;
  const { jobs } = useUploadQueue(queue);
  useLeaveGuard(jobs);
  useEffect(() => {
    void queue.restore();
  }, [queue]);
  return (
    <>
      <UploadTray queue={queue} />
      <UploadProgressDialog queue={queue} />
    </>
  );
};

export { UploadLayer };
export type { UploadLayerProps };
