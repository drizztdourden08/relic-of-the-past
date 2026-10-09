/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { TextInput } from '@ds/primitives/TextInput';
import { HINT, INSTALLED_HINT } from './MsuPackToolbar.constants';
import type { MsuPackToolbarProps } from './MsuPackToolbar.type';

const MsuPackToolbar = (props: MsuPackToolbarProps) => {
  const { name, busy, nameInstalled, onNameChange, onCreate } = props;
  const blocked = busy || nameInstalled || !name.trim();

  return (
    <Box className="import-form">
      <Field label="Pack Name" hint={nameInstalled ? INSTALLED_HINT : HINT}>
        <Flex gap="sm" align="center">
          <TextInput
            type="text"
            placeholder="My Music Pack"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !blocked) onCreate(); }}
          />
          <Button variant="secondary" size="sm" disabled={blocked} onClick={onCreate}>
            Create Empty
          </Button>
        </Flex>
      </Field>
    </Box>
  );
};

export { MsuPackToolbar };
