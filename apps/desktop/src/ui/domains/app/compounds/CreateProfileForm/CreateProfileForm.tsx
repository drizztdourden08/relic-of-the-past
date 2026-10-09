/* @layer renderer-components @kind component */
import { Box, Button, Field, Select, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import './CreateProfileForm.css';
import type { CreateProfileFormProps } from './CreateProfileForm.type';

const romLabel = (romFile: string): string => romFile.replace(/\.(sfc|smc)$/i, '');

const CreateProfileForm = (props: CreateProfileFormProps) => {
  const { readyRoms, romFile, extracting, onRomChange, onImportRom } = props;

  if (readyRoms.length === 0) {
    return (
      <Box className="create-profile-form">
        <Text variant="body">A profile plays one ROM. Import your copy of the game to create one.</Text>
        <Button variant="secondary" onClick={onImportRom} disabled={extracting} icon={extracting ? <Spinner size="sm" /> : undefined}>
          {extracting ? 'Extracting assets...' : 'Import ROM'}
        </Button>
      </Box>
    );
  }

  return (
    <Box className="create-profile-form">
      <Field label="ROM">
        <Select value={romFile} onChange={onRomChange} options={readyRoms.map((rom) => ({ value: rom.romFile, label: romLabel(rom.romFile) }))} placeholder="Select ROM..." />
      </Field>
    </Box>
  );
};

export {
  CreateProfileForm,
};
