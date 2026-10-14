/* @layer renderer-components @kind component */
import { Card, Box, Flex, Text, Status, Button, IconButton, Icon } from '@drizztdourden08/tessera/primitives';
import { formatRomName } from '../../format/format-rom-name';
import { formatSize } from './behavior/format-size';
import './RomCard.css';
import { type RomCardProps } from './RomCard.type';

const RomCard = (props: RomCardProps) => {
  const { rom, onExtract, onDelete } = props;
  const isFailed = rom.extractionStatus === 'failed';

  return (
    <Card variant={isFailed ? 'danger' : 'default'} className="rom-card">
      <Flex direction="column" className="rom-card__main">
        <Text className="rom-card__name">{formatRomName(rom.romFile)}</Text>
        <Text tone="faint" className="rom-card__file">{rom.romFile}</Text>
      </Flex>

      <Box className="rom-card__status">
        {rom.extractionStatus === 'ready' && (
          <Status tone="success">
            <Icon name="check" size={12} aria-hidden /> Ready
            {rom.assetSize != null && (
              <Text tone="faint" className="rom-card__size">{formatSize(rom.assetSize)}</Text>
            )}
          </Status>
        )}
        {rom.extractionStatus === 'extracting' && (
          <Status tone="warning">⟳ Extracting...</Status>
        )}
        {rom.extractionStatus === 'failed' && (
          <Flex direction="column" align="end" gap="xs" className="rom-card__failed-group">
            <Status tone="danger"><Icon name="x" size={12} aria-hidden /> Incompatible ROM</Status>
            <Button variant="danger" size="sm" onClick={() => onExtract(rom.romFile)}>
              Retry Extract
            </Button>
          </Flex>
        )}
        {rom.extractionStatus === 'idle' && (
          <Button variant="primary" size="sm" onClick={() => onExtract(rom.romFile)}>
            Extract Assets
          </Button>
        )}
      </Box>

      <IconButton variant="danger" label={`Remove ${rom.romFile}`} onClick={() => onDelete(rom.romFile)}>
        ✕
      </IconButton>
    </Card>
  );
};

export {
  RomCard,
};
