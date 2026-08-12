/* @layer renderer-components @kind component */
import { Field, Text, TextInput, Textarea } from '@ds/primitives';
import type { UseControllerReportForm } from '../controller-report-form.type';

type UserInfoStepProps = Pick<
  UseControllerReportForm,
  'email' | 'setEmail' | 'emailTouched' | 'emailValid' | 'name' | 'setName' | 'additionalInfo' | 'setAdditionalInfo' | 'debugText'
>;

/** Step 2 — contact info plus the same auto-collected debug info the bug report attaches. */
const UserInfoStep = (props: UserInfoStepProps) => {
  const { email, setEmail, emailTouched, emailValid, name, setName, additionalInfo, setAdditionalInfo, debugText } = props;

  return (
    <>
      <Field label="Email" required error={emailTouched && !emailValid ? 'Enter a valid email' : undefined}>
        <TextInput type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <Field label="Name" hint="Optional">
        <TextInput placeholder="How should we credit the report?" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>

      <Field label="Additional info" hint="What happened? Which buttons or sticks are affected?">
        <Textarea rows={4} value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
      </Field>

      <Text as="p" className="controller-report__hint">
        The same app/OS/hardware debug info attached to normal bug reports is included automatically.
      </Text>
      <Text as="pre" className="controller-report__section-text">{debugText ?? 'Collecting…'}</Text>
    </>
  );
};

export { UserInfoStep };
export type { UserInfoStepProps };
