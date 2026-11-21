/* @layer renderer-app @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Flex, Text } from '@drizztdourden08/tessera/primitives';
import './TouchEditBar.css';
import type { TouchEditBarProps } from './TouchEditBar.type';

const TouchEditBar = (props: TouchEditBarProps) => {
  const t = useT();
  const { orientation, onAdd, onLayer, onCancel, onDone } = props;
  return (
    <Box className="touch-edit-bar" onPointerDown={(event) => event.stopPropagation()}>
      <Text variant="label" className="touch-edit-bar__title">{t('views-touch-controls:edit.title', { orientation })}</Text>
      <Flex gap="sm" align="center" className="touch-edit-bar__actions">
        <Button size="sm" variant="secondary" onClick={onAdd}>{t('views-touch-controls:edit.add')}</Button>
        <Button size="sm" variant="secondary" onClick={onLayer}>{t('views-touch-controls:edit.layer')}</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>{t('views-touch-controls:edit.cancel')}</Button>
        <Button size="sm" variant="primary" onClick={onDone}>{t('views-touch-controls:edit.done')}</Button>
      </Flex>
    </Box>
  );
};

export { TouchEditBar };
