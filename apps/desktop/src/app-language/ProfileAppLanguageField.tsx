/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Field } from '@drizztdourden08/tessera/primitives';
import { updateProfile } from '@app/storage/profile-store';
import { AppLanguageSelect } from './AppLanguageSelect';

interface ProfileAppLanguageFieldProps {
  profile: Profile;
  onRefresh: () => void;
}

const ProfileAppLanguageField = ({ profile, onRefresh }: ProfileAppLanguageFieldProps) => {
  const t = useT();
  return (
    <Field label={t('common:appLanguage.profile.label')}>
      <AppLanguageSelect
        inherit
        value={profile.appLanguage ?? ''}
        onChange={async (tag) => {
          await updateProfile(profile.id, { appLanguage: tag || null });
          onRefresh();
        }}
      />
    </Field>
  );
};

export { ProfileAppLanguageField };
