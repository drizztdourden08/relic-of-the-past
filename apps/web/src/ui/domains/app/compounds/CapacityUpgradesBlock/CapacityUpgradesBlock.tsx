/* @layer renderer-components @kind component */
/**
 * The "Capacity upgrades" section of an options panel: its own live group
 * title (the same one the player's choices carry), the master switch for the
 * whole feature, the one progressive switch over every Custom family as a
 * plain option row, one CapacityFamilyRow per family, and the notes (every
 * fallback the profile reader applied, plus whatever the pond rule is
 * forcing) underneath. With the master switch off everything below it greys
 * out and freezes — the families are not the player's to set while the
 * feature is out. Shared by the creation panel and the Run tab; the rows
 * arrive derived, edits leave keyed by family.
 */
import { Box, Text } from '@ds/primitives';
import { CapacityFamilyRow } from '../CapacityFamilyRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { RandomizerOptionRow } from '../RandomizerOptionRow';
import type { CapacityRowModel, CapacityRowState } from '../CapacityFamilyRow';
import type { CapacityFamilyId, FamilyBonus } from '@shared/randomizer/ap-world/capacity';
import type { ApOptionDef } from '@shared/randomizer/ap-world/options.type';
import './CapacityUpgradesBlock.css';

interface CapacityUpgradesBlockProps {
  rows: readonly CapacityRowModel[];
  notes: readonly string[];
  /** The catalog row of the master switch, rendered above everything else. */
  enabledOption?: ApOptionDef;
  /** The master switch itself; off greys and freezes the rest of the block. */
  enabled?: boolean;
  /** The catalog row of the progressive switch, rendered above the families. */
  progressiveOption?: ApOptionDef;
  progressive?: boolean;
  readOnly?: boolean;
  onChange?: (family: CapacityFamilyId, next: CapacityRowState) => void;
  onBonusChange?: (family: CapacityFamilyId, next: FamilyBonus) => void;
  onEnabledChange?: (enabled: boolean) => void;
  onProgressiveChange?: (progressive: boolean) => void;
}

const CapacityUpgradesBlock = (props: CapacityUpgradesBlockProps) => {
  const {
    rows, notes, enabledOption, enabled = true, progressiveOption, progressive = false, readOnly = false,
    onChange, onBonusChange, onEnabledChange, onProgressiveChange,
  } = props;
  const frozen = readOnly || !enabled;

  return (
    <RandomizerOptionGroup title="Capacity upgrades" live className="capacity-block">
      {enabledOption !== undefined && (
        <RandomizerOptionRow
          option={enabledOption}
          value={enabled}
          disabled={readOnly}
          onChange={readOnly || onEnabledChange === undefined ? undefined : (next) => onEnabledChange(Boolean(next))}
        />
      )}
      <Box className={`capacity-block__body${enabled ? '' : ' capacity-block__body--off'}`}>
        {progressiveOption !== undefined && (
          <RandomizerOptionRow
            option={progressiveOption}
            value={progressive}
            disabled={frozen}
            onChange={frozen || onProgressiveChange === undefined ? undefined : (next) => onProgressiveChange(Boolean(next))}
          />
        )}
        {rows.map((row) => (
          <CapacityFamilyRow
            key={row.id}
            model={row}
            readOnly={frozen}
            onChange={frozen || onChange === undefined ? undefined : (next) => onChange(row.id, next)}
            onBonusChange={frozen || onBonusChange === undefined ? undefined : (next) => onBonusChange(row.id, next)}
          />
        ))}
      </Box>
      {notes.map((note) => (
        <Text key={note} className="capacity-block__note">{note}</Text>
      ))}
    </RandomizerOptionGroup>
  );
};

export { CapacityUpgradesBlock };
export type { CapacityUpgradesBlockProps };
