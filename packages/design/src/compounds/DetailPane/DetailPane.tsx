/* @layer site-kit @kind component */
import { Card, Flex, Stack, StatRow, Text } from '@drizztdourden08/tessera/primitives';
import { WindowHeader } from '@drizztdourden08/tessera/composites';
import type { DetailPaneProps } from './DetailPane.type';
import './DetailPane.css';

const DetailPane = (props: DetailPaneProps) => {
  const { title, fields, actions, notice, onClose, media, className, children } = props;
  return (
    <Card className={className ? `detail ${className}` : 'detail'}>
      <Stack as="aside" gap="md" align="stretch">
        <WindowHeader title={<Text as="span" className="detail__title">{title}</Text>} titleWrap onClose={onClose} className="detail__head" />
        {media}
        <Stack gap="xs" align="stretch">
          {fields.map((field) => (
            <StatRow
              key={field.label}
              label={<Text as="span" className="detail__label">{field.label}</Text>}
              value={<Text as="span" className="detail__value">{field.value}</Text>}
              className="detail__field"
            />
          ))}
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
