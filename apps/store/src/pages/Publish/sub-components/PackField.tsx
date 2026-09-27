/* @layer store-site @kind component */
/** The pack: a drop zone until a file is picked, then its name, size and kind with a way to pick another. */
import { Button } from '@ds/primitives/Button';
import { DropZone } from '@ds/primitives/DropZone';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { Text } from '@ds/primitives/Text';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { KindChip } from '../../../components/KindChip/KindChip';
import { PACK_ACCEPT } from '../Publish.constants';
import type { PackState } from '../behavior/usePack';

type PackFieldProps = { pack: PackState };

const PackField = (props: PackFieldProps) => {
  const { pack } = props;
  return (
    <Field label="Pack" error={pack.problem ?? undefined}>
      {pack.file
        ? (
          <Flex align="center" gap="sm" wrap className="publish__pack">
            <Text as="span" className="publish__pack-name">{pack.file.name}</Text>
            <Text as="span" variant="caption">{formatBytes(pack.file.size)}</Text>
            {pack.kind && <KindChip kind={pack.kind} />}
            <Button variant="ghost" size="sm" onClick={pack.clear}>Pick another</Button>
          </Flex>
        )
        : <DropZone accept={PACK_ACCEPT} label="Drop the pack here" hint=".msul music, .rsp character or .rlang language" onDrop={pack.drop} />}
    </Field>
  );
};

export { PackField };
export type { PackFieldProps };
