/* @layer store-site @kind component */
import { Button, Flex, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { navigate } from '@rotp/design';
import { SUBMIT_LABELS } from '../Publish.constants';
import type { PublishFooterProps } from './PublishFooter.type';

const PublishFooter = (props: PublishFooterProps) => {
  const { mode, form } = props;

  return (
    <Stack gap="xs" align="stretch" className="publish__footer">
      {form.error && <Text as="p" variant="caption" role="alert">{form.error}</Text>}
      <Flex gap="sm" justify="end">
        <Button variant="tertiary" disabled={form.busy} onClick={() => navigate('/publications')}>Cancel</Button>
        <Button variant="primary" disabled={form.busy || form.note !== null} onClick={form.submit}>{SUBMIT_LABELS[mode]}</Button>
      </Flex>
    </Stack>
  );
};

export { PublishFooter };
