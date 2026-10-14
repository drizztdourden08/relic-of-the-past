/* @layer renderer-components @kind component */
import { Dialog } from '@drizztdourden08/tessera/composites';
import { Text, Box, Icon } from '@drizztdourden08/tessera/primitives';
import type { HomeTabDialogProps } from '../home-tab.type';

const InvalidSramDialog = ({ saves, onClose }: HomeTabDialogProps) => {
  const { dialog } = saves;

  return (
    <Dialog
      open={dialog.type === 'import-sram-invalid'}
      title="Not a Valid Save"
      message=""
      confirmLabel="OK"
      hideCancel
      onConfirm={onClose}
      onCancel={onClose}
    >
      <Box className="home-tab-dialogs__callout home-tab-dialogs__callout--bad">
        <Icon className="home-tab-dialogs__callout-icon" name="triangle-alert" />
        <Text as="span">{dialog.detail ?? 'That file is not a valid ALttP SRAM save.'}</Text>
      </Box>
    </Dialog>
  );
};

export { InvalidSramDialog };
