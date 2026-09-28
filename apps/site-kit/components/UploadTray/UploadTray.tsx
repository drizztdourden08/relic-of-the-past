/* @layer site-kit @kind component */
/**
 * The uploads tray: floating bottom right above the page on every page of the site, one row
 * per job, newest first. A row opens that job's dialog. The header folds the list or closes
 * the tray until the next job; "Clear finished" drops the rows that are over.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Portal } from '@ds/primitives/Portal';
import { Stack } from '@ds/primitives/Stack';
import { UploadRow } from '../UploadRow';
import { useUploadQueue } from '../../upload/useUploadQueue';
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
