/* @layer renderer-components @kind component */
import { useState } from 'react';
import { Box } from '../../../../design-system/primitives/Box';
import { Flex } from '../../../../design-system/primitives/Flex';
import { Button } from '../../../../design-system/primitives/Button';
import { TextInput } from '../../../../design-system/primitives/TextInput';
import { Select } from '../../../../design-system/primitives/Select';
import './CreateProfileForm.css';
import { type CreateProfileFormProps } from './CreateProfileForm.type';

const CreateProfileForm = (props: CreateProfileFormProps) => {
  const { readyRoms, onCreate, onCancel } = props;
  const [name, setName] = useState('');
  const [rom, setRom] = useState(readyRoms[0]?.romFile ?? '');

  const formatRomName = (romFile: string): string =>
    romFile.replace(/\.(sfc|smc)$/i, '');

  const romOptions = readyRoms.map((r) => ({ value: r.romFile, label: formatRomName(r.romFile) }));

  const handleSubmit = () => {
    if (!name.trim() || !rom) return;
    onCreate(name.trim(), rom);
  };

  return (
    <Box className="create-profile-form">
      <TextInput
        type="text"
        placeholder="Profile name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        autoFocus
      />
      {readyRoms.length > 0 && (
        <Select value={rom} onChange={setRom} options={romOptions} />
      )}
      <Flex className="create-profile-form__actions">
        <Button variant="primary" onClick={handleSubmit}>Create</Button>
        <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
      </Flex>
    </Box>
  );
};

export {
  CreateProfileForm,
};
