/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Button, Card, Stack, Text } from '@drizztdourden08/tessera/primitives';
import type { WaitingStateProps } from '../HubAccountCard.type';

const WaitingState = (props: WaitingStateProps) => {
  const t = useT();
  const { userCode, siteHost, onCancel } = props;

  return (
    <Card className="hub-account">
      <Stack gap="sm" align="start">
        <Text as="p" className="hub-account__code">{userCode ?? '...'}</Text>
        <Text as="p" className="hub-account__lead">
          {t('compounds:hub-account-card.waiting', { siteHost })}
        </Text>
        <Button variant="secondary" onClick={onCancel}>{t('compounds:hub-account-card.cancel')}</Button>
      </Stack>
    </Card>
  );
};

export { WaitingState };
