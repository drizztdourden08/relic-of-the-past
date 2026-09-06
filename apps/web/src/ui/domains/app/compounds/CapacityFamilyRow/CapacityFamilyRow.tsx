/* @layer renderer-components @kind component */
/**
 * One capacity family in the options panel, read top to bottom as a list of
 * named lines. The head sits on the same label | control | impact grid as
 * every plain option row: the family, with what its modes do under it in the
 * words of its own catalog row, the mode dropdown, the In Pool cell. Under
 * the head, one line per fact: the Custom lines (range, items, jumps) only
 * while the mode is Custom; the pickup bonus whenever the family hands out
 * upgrade items (Custom or in pool); the ladder, in every mode, as the thing
 * that says what the player actually gets. Bare: the model arrives derived,
 * edits leave as a row state or a family bonus.
 *
 * A row a sibling setting has taken out of the player's hands (`forced`)
 * renders inert with the reason in red under its head: the controls grey out,
 * the sentence does not, the same way a forced plain option row reads.
 */
import { Box, Select, Text } from '@ds/primitives';
import { LadderPreview } from '../LadderPreview';
import { OptionDescription } from '../OptionDescription';
import { PoolImpactCell } from '../PoolImpactCell';
import { BonusLine } from './sub-components/BonusLine';
import { CustomControls } from './sub-components/CustomControls';
import { RowLine } from './sub-components/RowLine';
import type { CapacityFamilyRowProps, CapacityRowState } from './CapacityFamilyRow.type';
import type { SelectOption } from '@ds/primitives';
import './CapacityFamilyRow.css';

const MODE_OPTIONS: readonly SelectOption[] = [
  { value: 'vanilla', label: 'Vanilla' },
  { value: 'vanilla-in-pool', label: 'Vanilla in pool' },
  { value: 'custom', label: 'Custom' },
];

const WALLET_MODE_OPTIONS: readonly SelectOption[] = MODE_OPTIONS.filter((option) => option.value !== 'vanilla-in-pool');

const CapacityFamilyRow = (props: CapacityFamilyRowProps) => {
  const { model, readOnly = false, onChange, onBonusChange } = props;
  const { label, caption, offersInPool, state, preview, impact, footnote, forced, bonus, bonusCaption } = model;
  const inert = readOnly || forced !== undefined;

  const patch = (part: Partial<CapacityRowState>) => onChange?.({ ...state, ...part });

  return (
    <Box className={`capacity-row${forced !== undefined ? ' capacity-row--forced' : ''}`}>
      <Box className="capacity-row__head">
        <Box className="capacity-row__text">
          <Text className="capacity-row__label">{label}</Text>
          {caption !== undefined && <OptionDescription className="capacity-row__caption" description={caption} />}
        </Box>
        <Box className="capacity-row__mode">
          <Select
            size="sm"
            value={state.mode}
            options={(offersInPool ? MODE_OPTIONS : WALLET_MODE_OPTIONS) as SelectOption[]}
            onChange={(mode) => patch({ mode: mode as CapacityRowState['mode'] })}
            disabled={inert}
          />
        </Box>
        <PoolImpactCell cell={impact} />
      </Box>
      {forced !== undefined && <Text className="capacity-row__forced">{forced}</Text>}
      <Box className="capacity-row__lines">
        {state.mode === 'custom' && <CustomControls model={model} readOnly={inert} onChange={patch} />}
        {bonus !== undefined && (
          <BonusLine bonus={bonus} caption={bonusCaption} readOnly={inert} onChange={inert ? undefined : onBonusChange} />
        )}
        <RowLine label="ladder" className="capacity-row__ladder">
          <LadderPreview {...preview} />
        </RowLine>
      </Box>
      {footnote !== undefined && <Text className="capacity-row__footnote">{footnote}</Text>}
    </Box>
  );
};

export { CapacityFamilyRow };
