/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import copyIcon from '@iconify-icons/lucide/copy';
import refreshIcon from '@iconify-icons/lucide/refresh-cw';
import trashIcon from '@iconify-icons/lucide/trash-2';
import { Box, Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import type { OriginActionsProps } from '../InstalledOrigin.type';

const OriginActions = (props: OriginActionsProps) => {
  const t = useT();
  const { busy, copyRefusal, updateTo, onDuplicate, onUpdate, onAskUninstall } = props;

  return (
    <Flex align="center" gap="sm" wrap>
      <Button
        variant="secondary"
        size="sm"
        icon={<IconifyIcon icon={copyIcon} />}
        disabled={busy || copyRefusal !== null}
        onClick={onDuplicate}
      >
        {t('compounds:installed-origin.duplicate-to-edit')}
      </Button>
      {copyRefusal !== null && <Text as="span" className="installed-origin__refusal">{copyRefusal}</Text>}
      {updateTo !== null && (
        <Button variant="primary" size="sm" icon={<IconifyIcon icon={refreshIcon} />} disabled={busy} onClick={onUpdate}>
          {t('compounds:installed-origin.update-to', { version: updateTo })}
        </Button>
      )}
      <Box className="installed-origin__spacer" />
      <Button variant="danger" size="sm" icon={<IconifyIcon icon={trashIcon} />} disabled={busy} onClick={onAskUninstall}>
        {t('compounds:installed-origin.uninstall')}
      </Button>
    </Flex>
  );
};

export { OriginActions };
