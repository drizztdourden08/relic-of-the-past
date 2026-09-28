/* @layer store-site @kind component */
/**
 * The pack: one drop zone that takes a file by drop, pick or paste. Once it holds a pack of
 * the right kind within the cap, it says so in green inside; another drop or paste
 * replaces it. What is wrong with a file shows under the field.
 */
import { DropZone } from '@ds/primitives/DropZone';
import type { DropZoneStatus } from '@ds/primitives/DropZone';
import { Field } from '@ds/primitives/Field';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { KIND_LABELS } from '../../../lib/kinds';
import { PACK_ACCEPT } from '../Publish.constants';
import type { PackState } from '../behavior/usePack';

type PackFieldProps = { pack: PackState };

const readyStatus = ({ file, kind, problem }: PackState): DropZoneStatus | undefined => {
  if (!file || !kind || problem) return undefined;
  return { tone: 'success', message: `Ready: ${file.name}, a ${KIND_LABELS[kind]} pack of ${formatBytes(file.size)}` };
};

const PackField = (props: PackFieldProps) => {
  const { pack } = props;
  return (
    <Field label="Pack" error={pack.problem ?? undefined}>
      <DropZone
        accept={PACK_ACCEPT}
        label={pack.file ? 'Drop or paste another pack to replace it' : 'Drop the pack here'}
        hint=".msul music, .rsp character or .rlang language"
        status={readyStatus(pack)}
        onDrop={pack.drop}
      />
    </Field>
  );
};

export { PackField };
export type { PackFieldProps };
