/* @layer renderer-components @kind component */
// One name field for both a new empty pack and an import: two fields invite filling in the wrong one.
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { TextInput } from '@ds/primitives/TextInput';

interface MsuPackToolbarProps {
  name: string;
  busy: boolean;
  /** The name is a pack installed from the Hookshop, which nothing may write into. */
  nameInstalled: boolean;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

const HINT = 'Names a new empty pack, or the pack an import creates.';
const INSTALLED_HINT = 'That name is a pack installed from the Hookshop, which stays read only. Pick another.';

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
export type { MsuPackToolbarProps };
