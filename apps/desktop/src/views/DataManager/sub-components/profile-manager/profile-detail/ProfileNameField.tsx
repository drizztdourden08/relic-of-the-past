/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, ButtonRow, Field, TextInput } from '@drizztdourden08/tessera/primitives';
import { useProfileNameField } from './useProfileNameField';

const ProfileNameField = ({ profile, onRefresh }: { profile: Profile; onRefresh: () => void }) => {
  const t = useT();
  const { draft, setDraft, error, dirty, commit, revert } = useProfileNameField(profile, onRefresh);

  return (
    <Field label={t('data-manager:profile-manager.profile-name-field.name')} hint={t('data-manager:profile-manager.profile-name-field.saved-when-you-press-enter')} error={error}>
      <TextInput
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onEnter={() => void commit()}
        onBlur={() => void commit()}
      />
      {dirty && (
        <ButtonRow align="end">
          <Button variant="ghost" size="sm" onClick={revert}>{t('data-manager:profile-manager.profile-name-field.revert')}</Button>
          <Button variant="primary" size="sm" onClick={() => void commit()}>{t('data-manager:profile-manager.profile-name-field.save-name')}</Button>
        </ButtonRow>
      )}
    </Field>
  );
};

export { ProfileNameField };
