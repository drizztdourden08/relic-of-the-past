/* @layer store-site @kind component */
/** The version's number and what changed in it, shown to players once it is approved. */
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { Textarea } from '@ds/primitives/Textarea';
import type { PublishForm } from '../behavior/usePublishForm';

type VersionFieldsProps = {
  version: PublishForm['version'];
  /** The last version's number, as a hint; null for a first version. */
  last: string | null;
};

const VersionFields = (props: VersionFieldsProps) => {
  const { version, last } = props;
  return (
    <>
      <Field label="Version" hint={last ? `The last one was ${last}.` : 'Three numbers, like 1.0.0.'} htmlFor="publish-semver">
        <TextInput id="publish-semver" value={version.semver} onChange={(event) => version.setSemver(event.target.value)} placeholder="1.0.0" />
      </Field>
      <Field label="Changes" hint="What is new in this version, for players and reviewers." htmlFor="publish-changes">
        <Textarea id="publish-changes" rows={3} value={version.changelog} onChange={(event) => version.setChangelog(event.target.value)} />
      </Field>
    </>
  );
};

export { VersionFields };
export type { VersionFieldsProps };
