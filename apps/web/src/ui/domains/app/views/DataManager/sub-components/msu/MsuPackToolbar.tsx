/* @layer renderer-components @kind component */
/**
 * The name field above the pack list. One field serves both jobs — it names a pack created from
 * nothing, and it names the pack an import lands in — because they are the same question asked
 * at the same moment, and two fields would only invite the user to fill in the wrong one.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Flex } from '@ds/primitives/Flex';
import { TextInput } from '@ds/primitives/TextInput';

interface MsuPackToolbarProps {
  name: string;
  busy: boolean;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

const MsuPackToolbar = (props: MsuPackToolbarProps) => {
  const { name, busy, onNameChange, onCreate } = props;

  return (
    <Box className="import-form">
      <Field label="Pack Name" hint="Names a new empty pack, or the pack an import creates.">
        <Flex gap="sm" align="center">
          <TextInput
            type="text"
            placeholder="My Music Pack"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && name.trim() && !busy) onCreate(); }}
          />
          <Button variant="secondary" size="sm" disabled={busy || !name.trim()} onClick={onCreate}>
            Create Empty
          </Button>
        </Flex>
      </Field>
    </Box>
  );
};

export { MsuPackToolbar };
export type { MsuPackToolbarProps };
