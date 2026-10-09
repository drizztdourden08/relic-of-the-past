/* @layer site-kit @kind component */
import { Card } from '@ds/primitives/Card';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import { WindowHeader } from '@ds/composites/WindowHeader';
import type { DetailPaneProps } from './DetailPane.type';
import './DetailPane.css';

const DetailPane = (props: DetailPaneProps) => {
  const { title, fields, actions, notice, onClose, media, className, children } = props;
  return (
    <Card className={className ? `detail ${className}` : 'detail'}>
      <Stack as="aside" gap="md" align="stretch">
        <WindowHeader title={title} onClose={onClose} className="detail__head" />
        {media}
        <Stack gap="xs" align="stretch">
          {fields.map((field) => <StatRow key={field.label} label={field.label} value={field.value} className="detail__field" />)}
        </Stack>
        {children}
        {actions && <Flex gap="sm" align="center" wrap className="detail__actions">{actions}</Flex>}
        {notice && <Text as="p" variant="caption" role="status" className="detail__notice">{notice}</Text>}
      </Stack>
    </Card>
  );
};

export { DetailPane };
export type { DetailField, DetailPaneProps } from './DetailPane.type';
