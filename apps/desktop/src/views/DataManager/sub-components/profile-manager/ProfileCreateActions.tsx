/* @layer renderer-components @kind component */
import { Button, ButtonRow } from '@drizztdourden08/tessera/primitives';
import type { ProfileCreateActionsProps } from './profile-manager.type';

const ProfileCreateActions = ({ form, onCancel, onCreate }: ProfileCreateActionsProps) => {
  const { formName, formRom, formInvalid, formJoining: joining } = form;
  const busy = joining !== null;

  return (
    <ButtonRow>
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
      <Button variant="primary" size="sm" onClick={onCreate} loading={busy} disabled={busy || !formName.trim() || !formRom || formInvalid}>
        {joining === null ? 'Create' : `Joining ${Math.round(joining * 100)}%`}
      </Button>
    </ButtonRow>
  );
};

export { ProfileCreateActions };
