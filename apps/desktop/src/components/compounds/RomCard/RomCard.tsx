import { Badge } from '../../primitives/Badge';
import { Button } from '../../primitives/Button';
import { IconButton } from '../../primitives/IconButton';
import { formatRomName, formatSize } from './behavior/formatters';
import './RomCard.css';

export interface RomCardProps {
  rom: RomDisplayInfo;
  onExtract: (romFile: string) => void;
  onDelete: (romFile: string) => void;
}

export const RomCard = (props: RomCardProps) => {
  const { rom, onExtract, onDelete } = props;
  const isFailed = rom.extractionStatus === 'failed';

  return (
    <div className={`rom-card ${isFailed ? 'rom-card--failed' : ''}`}>
      <div className="rom-card__main">
        <span className="rom-card__name">{formatRomName(rom.romFile)}</span>
        <span className="rom-card__file">{rom.romFile}</span>
      </div>

      <div className="rom-card__status">
        {rom.extractionStatus === 'ready' && (
          <Badge variant="success">
            ✓ Ready
            {rom.assetSize != null && (
              <span className="rom-card__size">{formatSize(rom.assetSize)}</span>
            )}
          </Badge>
        )}
        {rom.extractionStatus === 'extracting' && (
          <Badge variant="warning">⟳ Extracting…</Badge>
        )}
        {rom.extractionStatus === 'failed' && (
          <div className="rom-card__failed-group">
            <Badge variant="danger">✗ Incompatible ROM</Badge>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onExtract(rom.romFile)}
            >
              Retry Extract
            </Button>
          </div>
        )}
        {rom.extractionStatus === 'idle' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onExtract(rom.romFile)}
          >
            Extract Assets
          </Button>
        )}
      </div>

      <IconButton
        variant="danger"
        label={`Remove ${rom.romFile}`}
        onClick={() => onDelete(rom.romFile)}
      >
        ✕
      </IconButton>
    </div>
  );
};
