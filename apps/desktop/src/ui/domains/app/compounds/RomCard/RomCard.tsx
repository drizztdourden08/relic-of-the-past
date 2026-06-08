/* @layer renderer-components @kind data */
import { Card } from '../../../../design-system/primitives/Card';
import { Box } from '../../../../design-system/primitives/Box';
import { Flex } from '../../../../design-system/primitives/Flex';
import { Text } from '../../../../design-system/primitives/Text';
import { Badge } from '../../../../design-system/primitives/Badge';
import { Button } from '../../../../design-system/primitives/Button';
import { IconButton } from '../../../../design-system/primitives/IconButton';
import { formatRomName, formatSize } from './behavior/formatters';
import './RomCard.css';
import { type RomCardProps } from './RomCard.type';

const RomCard = (props: RomCardProps) => {
  const { rom, onExtract, onDelete } = props;
  const isFailed = rom.extractionStatus === 'failed';

  return (
    <Card variant={isFailed ? 'danger' : 'default'} className="rom-card">
      <Flex direction="column" className="rom-card__main">
        <Text className="rom-card__name">{formatRomName(rom.romFile)}</Text>
        <Text className="rom-card__file">{rom.romFile}</Text>
      </Flex>

      <Box className="rom-card__status">
        {rom.extractionStatus === 'ready' && (
          <Badge variant="success">
            ✓ Ready
            {rom.assetSize != null && (
              <Text className="rom-card__size">{formatSize(rom.assetSize)}</Text>
            )}
          </Badge>
        )}
        {rom.extractionStatus === 'extracting' && (
          <Badge variant="warning">⟳ Extracting…</Badge>
        )}
        {rom.extractionStatus === 'failed' && (
          <Flex direction="column" align="end" gap="xs" className="rom-card__failed-group">
            <Badge variant="danger">✗ Incompatible ROM</Badge>
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
