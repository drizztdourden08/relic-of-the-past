/* @layer renderer-components @kind component */
import { Button, Icon, Inline, Text } from '@drizztdourden08/tessera/primitives';
import { NOTICE_LABELS, UNDO_LABEL } from '../SaveRow.constants';
import type { SaveRowNoticeProps } from '../SaveRow.type';

const SaveRowNoticeLine = ({ notice }: SaveRowNoticeProps) => (
  <Inline gap="sm" role="status">
    <Text variant="caption" tone="dim">{NOTICE_LABELS[notice.kind]}</Text>
    <Button size="xs" variant="secondary" icon={<Icon name="undo-2" />} onClick={notice.onUndo}>{UNDO_LABEL}</Button>
  </Inline>
);

export { SaveRowNoticeLine };
