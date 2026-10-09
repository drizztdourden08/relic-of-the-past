/* @layer site-kit @kind component */
import { Box, Button, Flex, Portal, Stack } from '@drizztdourden08/tessera/primitives';
import { UploadRow } from '../UploadRow';
import { useUploadQueue } from '../../hooks/useUploadQueue/useUploadQueue';
import { useTrayState } from './behavior/useTrayState';
import { TrayHeader } from './sub-components/TrayHeader';
import type { UploadTrayProps } from './UploadTray.type';
import './UploadTray.css';

const UploadTray = (props: UploadTrayProps) => {
  const { queue } = props;
  const { jobs } = useUploadQueue(queue);
  const tray = useTrayState(jobs);
  if (!tray.shown) return null;
  return (
    <Portal layer="overlay">
      <Box as="section" className="upload-tray" aria-label="Uploads" data-collapsed={tray.collapsed ? 'yes' : undefined}>
        <TrayHeader tray={tray} />
        {!tray.collapsed && (
          <>
            <Stack gap="xs" align="stretch" className="upload-tray__list">
              {jobs.map((job) => (
                <UploadRow
                  key={job.id}
                  job={job}
                  onOpen={queue.open}
                  onCancel={queue.cancel}
                  onDismiss={queue.dismiss}
                  onPickFile={queue.pickFile}
                />
              ))}
            </Stack>
            {tray.anyFinished && (
              <Flex justify="end">
                <Button variant="ghost" size="sm" onClick={queue.clearFinished}>Clear finished</Button>
              </Flex>
            )}
          </>
        )}
      </Box>
    </Portal>
  );
};

export { UploadTray };
export type { UploadTrayProps };
