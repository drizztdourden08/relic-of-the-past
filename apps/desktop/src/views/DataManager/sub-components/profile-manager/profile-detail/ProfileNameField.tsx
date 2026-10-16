/* @layer renderer-components @kind component */
import { Button, ButtonRow, Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { useProfileNameField } from './useProfileNameField';

const ProfileNameField = ({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) => {
  const { draft, setDraft, error, dirty, commit, revert } = useProfileNameField(profile, onRefresh);

  return (
    <Field label="Name" hint="Saved when you press Enter or leave the field." error={error}>
      <TextInput
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onEnter={() => void commit()}
        onBlur={() => void commit()}
      />
      {dirty && (
        <ButtonRow align="end">
          <Button variant="ghost" size="sm" onClick={revert}>Revert</Button>
          <Button variant="primary" size="sm" onClick={() => void commit()}>Save name</Button>
        </ButtonRow>
      )}
    </Field>
  );
};

export { ProfileNameField };
