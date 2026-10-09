/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { Field, Text, TextInput, Textarea } from '@drizztdourden08/tessera/primitives';
import { githubHandleOf } from '@rotp/hub-client';
import { ReportingAsLine } from '../../../../../compounds/ReportingAsLine';
import type { UserInfoStepProps } from '../controller-report-form.type';

const UserInfoStep = (props: UserInfoStepProps) => {
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
          <Field label="Email" required error={emailTouched && !emailValid ? 'Enter a valid email' : undefined}>
            <TextInput type="email" placeholder="you@example.com" value={email} onChange={handleEmail} />
          </Field>

          <Field label="Name" hint="Optional">
            <TextInput placeholder="How should we credit the report?" value={name} onChange={handleName} />
          </Field>
        </>
      )}

      <Field label="Additional info" hint="What happened? Which buttons or sticks are affected?">
        <Textarea rows={4} value={additionalInfo} onChange={handleInfo} />
      </Field>

      <Text as="p" className="controller-report__hint">
        The same app/OS/hardware debug info attached to normal bug reports is included automatically.
      </Text>
      <Text as="pre" className="controller-report__section-text">{debugText ?? 'Collecting...'}</Text>
    </>
  );
};

export { UserInfoStep };
