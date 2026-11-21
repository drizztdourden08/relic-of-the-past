/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Dialog } from '@drizztdourden08/tessera/composites';
import { Text, Box, Icon } from '@drizztdourden08/tessera/primitives';
import type { HomeTabDialogProps } from '../home-tab.type';

const InvalidSramDialog = ({ saves, onClose }: HomeTabDialogProps) => {
  const t = useT();
  const { dialog } = saves;

  return (
    <Dialog
      open={dialog.type === 'import-sram-invalid'}
      title={t('profiles:home.invalid-dialog.title')}
      message=""
      confirmLabel={t('profiles:home.invalid-dialog.ok')}
      hideCancel
      onConfirm={onClose}
      onCancel={onClose}
    >
      <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--bad">
        <Icon className="home-tab-dialogs__callout-icon" name="triangle-alert" />
        <Text as="span">{dialog.detail ?? t('profiles:home.invalid-dialog.fallback')}</Text>
      </Box>
    </Dialog>
  );
};

export { InvalidSramDialog };
