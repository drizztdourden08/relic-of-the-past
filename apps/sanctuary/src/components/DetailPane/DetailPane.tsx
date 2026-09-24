/* @layer sanctuary-site @kind component */
/**
 * The right-hand pane of a page: the app's window header over a stack of stat rows for
 * the selected row's fields, whatever block the page adds under it (a note, an edit
 * form), and the actions row.
 */
import type { ReactNode } from 'react';
import { Card } from '@ds/primitives/Card';
import { Flex } from '@ds/primitives/Flex';
import { Stack } from '@ds/primitives/Stack';
import { StatRow } from '@ds/primitives/StatRow';
import { Text } from '@ds/primitives/Text';
import { WindowHeader } from '@ds/composites/WindowHeader';
import './DetailPane.css';

type DetailField = {
  label: string;
  value: ReactNode;
};

type DetailPaneProps = {
  title: ReactNode;
  fields: readonly DetailField[];
  actions?: ReactNode;
  /** Shown under the actions in a caption, e.g. the last error. */
  notice?: ReactNode;
  onClose?: () => void;
  children?: ReactNode;
};

const DetailPane = (props: DetailPaneProps) => {
  const { title, fields, actions, notice, onClose, children } = props;
  return (
    <Card className="detail">
      <Stack as="aside" gap="md" align="stretch">
        <WindowHeader title={title} onClose={onClose} className="detail__head" />
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
export type { DetailField, DetailPaneProps };
