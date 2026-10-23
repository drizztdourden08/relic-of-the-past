/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import bugIcon from '@iconify-icons/lucide/bug';
import { Box, Button, IconButton, Image, Text } from '@drizztdourden08/tessera/primitives';
import type { PageHeadProps } from '../ControllerPage.type';

const PageHead = ({ page, onRunDiagnostics, onReport }: PageHeadProps) => {
  const { deviceKey, name, idLabel, brandIcon, entry, adapterPort } = page;
  const runDiagnostics = useCallback(() => onRunDiagnostics?.(deviceKey), [onRunDiagnostics, deviceKey]);
  const report = useCallback(() => onReport(deviceKey), [onReport, deviceKey]);
  const port = adapterPort === null ? '' : ` | Port ${adapterPort}`;

  return (
    <Box className="controller-page__head">
      {brandIcon && <Image src={brandIcon} alt="" draggable={false} className="controller-page__brand" />}
      <Box className="controller-page__title">
        <Text className="controller-page__name">{name}</Text>
        <Text className="controller-page__sub">{`${idLabel} | ${entry.family ?? 'generic'} layout${port}`}</Text>
      </Box>
      <Box className="controller-page__actions">
        {onRunDiagnostics && (
          <Button variant="tertiary" size="sm" onClick={runDiagnostics}>Run diagnostics</Button>
        )}
        <IconButton variant="ghost" size="sm" label="Report this controller as not working" onClick={report}>
          <IconifyIcon icon={bugIcon} width={14} height={14} />
        </IconButton>
      </Box>
    </Box>
  );
};

export { PageHead };
