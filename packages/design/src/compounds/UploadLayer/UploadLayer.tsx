/* @layer site-kit @kind component */
import { useEffect } from 'react';
import { UploadProgressDialog } from '../UploadProgressDialog';
import { UploadTray } from '../UploadTray';
import { useLeaveGuard } from '../../hooks/useLeaveGuard';
import { useUploadQueue } from '../../hooks/useUploadQueue/useUploadQueue';
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
