/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { OptionGroup } from '@drizztdourden08/tessera/composites';
import { PROGRESSIVE_MODE_LABELS, progressiveTickConsequences, unrollableTickSetReasons } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import { ProgressiveLadderCard } from './sub-components/ProgressiveLadderCard';
import { modeOf } from './behavior/mode-of';
import { progressiveLaddersOf } from './behavior/progressive-ladders';
import { withFamilyMode } from './behavior/with-family-mode';
import { withTierTicked } from './behavior/with-tier-ticked';
import { BLOCKED_LEAD, MODE_OPTIONS, ORDERED_MODE, TIERS_CAPTION, TIERS_TITLE } from './ProgressiveTiersBlock.constants';
import type { ProgressiveTiersBlockProps } from './ProgressiveTiersBlock.type';
import './ProgressiveTiersBlock.css';

const ProgressiveTiersBlock = (props: ProgressiveTiersBlockProps) => {
  const { setting, modes, spritesAvailable = false, onChange, onModesChange } = props;
  const readOnly = onChange === undefined;
  const ladders = progressiveLaddersOf(setting, modes, spritesAvailable);
  const consequences = progressiveTickConsequences(setting);
  const blocked = unrollableTickSetReasons(setting);

  return (
    <Box className="progressive-tiers-block">
      <OptionGroup title={TIERS_TITLE} tone="live" className="progressive-tiers-block__group">
        <Text className="progressive-tiers-block__caption">{TIERS_CAPTION}</Text>
        <Box className="progressive-tiers-block__ladders">
          {ladders.map((ladder) => (
            <ProgressiveLadderCard
              key={ladder.id}
              ladder={ladder}
              modeOptions={MODE_OPTIONS}
              modeLabel={PROGRESSIVE_MODE_LABELS[modeOf(ladder.mode) ?? ORDERED_MODE]}
              disabled={readOnly}
              readout={readOnly}
              onRungChange={readOnly
                ? undefined
                : (index, checked) => onChange(withTierTicked(setting, ladder.id, index, checked))}
              onModeChange={onModesChange === undefined
                ? undefined
                : (mode) => {
                  const next = modeOf(mode);
                  if (next !== undefined) onModesChange(withFamilyMode(modes, ladder.id, next));
                }}
            />
          ))}
        </Box>
        {consequences.length > 0 && (
          <OptionDescription
            description={consequences}
            className="progressive-tiers-block__consequences"
          />
        )}
        {blocked.length > 0 && (
          <Box className="progressive-tiers-block__blocked">
            <Text className="progressive-tiers-block__blocked-lead">{BLOCKED_LEAD}</Text>
            {blocked.map((reason) => (
              <Text key={reason} className="progressive-tiers-block__blocked-line">{reason}</Text>
            ))}
          </Box>
        )}
      </OptionGroup>
    </Box>
  );
};

export { ProgressiveTiersBlock };
