/* @layer renderer-components @kind component */
import { Box, Select, Button, Field, ButtonRow, EmptyState, Icon } from '@drizztdourden08/tessera/primitives';
import { ImportProgress } from '../ImportProgress';
import { NO_ROMS_MESSAGE, romLabel } from './sprite-extract-panel.constants';
import type { SpriteExtractPanelProps } from './sprite-manager.type';

const SpriteExtractPanel = (props: SpriteExtractPanelProps) => {
  const { roms, extractedMap, toExtract, onToExtractChange, busy, message, progress, onExtract } = props;

  return (
    <Box className="import-form">
      <Field label="Add sprites from ROM">
        {roms.length > 0 ? (
          <Select
            value={toExtract}
            onChange={onToExtractChange}
            options={[{ value: '', label: 'Select a ROM...' }, ...roms.map(r => ({ value: r.romFile, label: romLabel(r.romFile, extractedMap) }))]}
            placeholder="Select a ROM..."
          />
        ) : (
          <EmptyState message={NO_ROMS_MESSAGE} />
        )}
      </Field>
      {roms.length > 0 && (
        <ButtonRow align="start">
          <Button
            variant="primary"
            size="sm"
            icon={<Icon name={busy ? 'refresh-cw' : 'image'} />}
            onClick={onExtract}
            disabled={!toExtract || busy}
          >
            {busy ? 'Working...' : 'Extract Sprites'}
          </Button>
        </ButtonRow>
      )}
      {busy && <ImportProgress state={progress} fallbackLabel="Extracting sprites..." />}
      {message && (
        <Box className={`sprite-manager__message sprite-manager__message--${message.type}`}>{message.text}</Box>
      )}
    </Box>
  );
};

export { SpriteExtractPanel };
