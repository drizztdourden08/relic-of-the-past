/* @layer renderer-app @kind component */
/** The four verdicts. Revert stays disabled until there are amendments; the batch names its own scope. */
import { Button, Flex, Text } from '@ds/primitives';

const ACCEPT = 'Accept';
const REJECT = 'Reject';
const REVERT = 'Revert edits';
const ACCEPT_ALL = 'Accept all certain';

interface RecommendationActionsProps {
  /** How many certain findings the batch would write, for the button's own count. */
  certainCount: number;
  isEdited: boolean;
  busy: boolean;
  error: string | null;
  onAccept: () => void;
  onReject: () => void;
  onRevert: () => void;
  onAcceptAll: () => void;
}

const RecommendationActions = (props: RecommendationActionsProps) => {
  const { certainCount, isEdited, busy, error, onAccept, onReject, onRevert, onAcceptAll } = props;

  return (
    <Flex className="rec-actions" gap="sm" align="center">
      <Button variant="primary" size="sm" disabled={busy} onClick={onAccept}>{ACCEPT}</Button>
      <Button variant="danger" size="sm" disabled={busy} onClick={onReject}>{REJECT}</Button>
      <Button variant="tertiary" size="sm" disabled={busy || !isEdited} onClick={onRevert}>{REVERT}</Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={busy || certainCount === 0}
        onClick={onAcceptAll}
      >
        {`${ACCEPT_ALL} (${certainCount})`}
      </Button>
      {error != null && <Text className="rec-actions__error">{error}</Text>}
    </Flex>
  );
};

export { RecommendationActions };
export type { RecommendationActionsProps };
