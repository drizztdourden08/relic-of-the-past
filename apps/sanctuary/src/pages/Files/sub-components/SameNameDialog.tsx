/* @layer sanctuary-site @kind component */
import { Button, Flex, Stack, StatRow, Text } from '@drizztdourden08/tessera/primitives';
import { DialogShell } from '@drizztdourden08/tessera/composites';
import { TypeChip } from '../../../components/TypeChip/TypeChip';
import { formatBytes } from '@site-kit/lib/format-bytes';
import { nextVersionNumber, versionLabel } from '../../../files/file-versions';
import type { SameNameDialogProps } from './SameNameDialog.type';

const SameNameDialog = (props: SameNameDialogProps) => {
  const { question, onSeparate, onVersion, onClose } = props;
  const next = question ? versionLabel(nextVersionNumber(question.match)) : '';

  const actions = (
    <>
      <Button variant="secondary" onClick={onSeparate}>Separate file</Button>
      <Button variant="primary" onClick={onVersion}>Upload as {next}</Button>
    </>
  );

  const matched = question && (
    <Flex gap="sm" align="center" wrap>
      <Text as="span">{question.match.name}</Text>
      <Text as="span" variant="caption">{versionLabel(question.match.currentVersion)}</Text>
      <TypeChip type={question.match.type} />
    </Flex>
  );

  return (
    <DialogShell open={question !== null} onClose={onClose} title="This file already exists" actions={actions} className="version-dialog">
      {question && (
        <Stack gap="sm" align="stretch">
          <StatRow label="dropped" value={`${question.dropped.name} · ${formatBytes(question.dropped.size)}`} className="version-dialog__row" />
          <StatRow label="matches" value={matched} className="version-dialog__row" />
        </Stack>
      )}
    </DialogShell>
  );
};

export { SameNameDialog };
