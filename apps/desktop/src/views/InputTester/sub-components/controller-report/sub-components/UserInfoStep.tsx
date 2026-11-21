/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Field, Text, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { githubHandleOf } from '@rotp/hub-client';
import { ReportingAsLine } from '../../../../../compounds/ReportingAsLine';
import type { UserInfoStepProps } from '../controller-report-form.type';

const UserInfoStep = (props: UserInfoStepProps) => {
  const t = useT();
  const { me, email, setEmail, emailTouched, emailValid, name, setName, additionalInfo, setAdditionalInfo, debugText } = props;
  const handleEmail = useCallback((e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value), [setEmail]);
  const handleName = useCallback((e: ChangeEvent<HTMLInputElement>) => setName(e.target.value), [setName]);
  const handleInfo = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => setAdditionalInfo(e.target.value),
    [setAdditionalInfo],
  );

  return (
    <>
      {me ? (
        <ReportingAsLine displayName={me.user.displayName} githubHandle={githubHandleOf(me.identities)} />
      ) : (
        <>
          <Field label={t('views-input-tester:user.email')} required error={emailTouched && !emailValid ? t('views-input-tester:user.emailInvalid') : undefined}>
            <TextInput type="email" placeholder={t('views-input-tester:user.emailPlaceholder')} value={email} onChange={handleEmail} />
          </Field>

          <Field label={t('views-input-tester:user.name')} hint={t('views-input-tester:user.optional')}>
            <TextInput placeholder={t('views-input-tester:user.namePlaceholder')} value={name} onChange={handleName} />
          </Field>
        </>
      )}

      <Field label={t('views-input-tester:user.additionalInfo')} hint={t('views-input-tester:user.additionalHint')}>
        <Textarea rows={4} value={additionalInfo} onChange={handleInfo} />
      </Field>

      <Text as="p" className="controller-report__hint">
        {t('views-input-tester:user.debugNote')}
      </Text>
      <Text as="pre" className="controller-report__section-text">{debugText ?? t('views-input-tester:collecting')}</Text>
    </>
  );
};

export { UserInfoStep };
