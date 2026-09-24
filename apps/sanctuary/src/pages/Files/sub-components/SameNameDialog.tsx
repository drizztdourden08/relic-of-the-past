/* @layer sanctuary-site @kind component */
/**
 * The question a dropped file with a known name asks: the dropped file beside the one it
 * matches, then keep it as a separate file or upload it as the match's next version.
 * Closing the dialog leaves that one file out of the drop.
 */
import { Button } from '@ds/primitives/Button';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { Text } from '@ds/primitives/Text';
import { DialogShell } from '@ds/composites/DialogShell';
import { Row } from '../../../components/Row/Row';
import { TypeChip } from '../../../components/TypeChip/TypeChip';
import { formatBytes } from '../../../lib/format-bytes';
import { nextVersionNumber, versionLabel } from '../../../files/file-versions';
import type { SameNameQuestion } from '../behavior/drop-queue';

type SameNameDialogProps = {
  question: SameNameQuestion | null;
  onSeparate: () => void;
  onVersion: () => void;
  onClose: () => void;
};

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
          <Row label="dropped" value={`${question.dropped.name} · ${formatBytes(question.dropped.size)}`} className="version-dialog__row" />
          <Row label="matches" value={matched} className="version-dialog__row" />
        </Stack>
      )}
    </DialogShell>
  );
};

export { SameNameDialog };
export type { SameNameDialogProps };
