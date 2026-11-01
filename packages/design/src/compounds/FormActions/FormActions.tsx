/* @layer site-kit @kind component */
import { Button, Flex } from '@drizztdourden08/tessera/primitives';
import type { FormActionsProps } from './FormActions.type';

const FormActions = (props: FormActionsProps) => {
  const { busy, canSave, onCancel } = props;
  return (
    <Flex gap="sm">
      <Button type="submit" variant="primary" size="sm" disabled={busy || !canSave}>Save</Button>
      <Button type="button" variant="tertiary" size="sm" disabled={busy} onClick={onCancel}>Cancel</Button>
    </Flex>
  );
};

export { FormActions };
