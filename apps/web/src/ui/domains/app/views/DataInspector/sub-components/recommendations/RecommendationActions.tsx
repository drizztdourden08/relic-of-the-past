/* @layer renderer-app @kind component */
import { Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import { ACCEPT_ALL_LABEL, ACCEPT_LABEL, REJECT_LABEL, REVERT_LABEL } from './RecommendationDetail.constants';
import type { RecommendationActionsProps } from './RecommendationDetail.type';

const RecommendationActions = (props: RecommendationActionsProps) => {
  const { certainCount, isEdited, busy, error, onAccept, onReject, onRevert, onAcceptAll } = props;

  return (
    <Flex className="rec-actions" gap="sm" align="center">
      <Button variant="primary" size="sm" disabled={busy} onClick={onAccept}>{ACCEPT_LABEL}</Button>
      <Button variant="danger" size="sm" disabled={busy} onClick={onReject}>{REJECT_LABEL}</Button>
      <Button variant="tertiary" size="sm" disabled={busy || !isEdited} onClick={onRevert}>{REVERT_LABEL}</Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={busy || certainCount === 0}
        onClick={onAcceptAll}
      >
        {`${ACCEPT_ALL_LABEL} (${certainCount})`}
      </Button>
      {error != null && <Text className="rec-actions__error">{error}</Text>}
    </Flex>
  );
};

export { RecommendationActions };
