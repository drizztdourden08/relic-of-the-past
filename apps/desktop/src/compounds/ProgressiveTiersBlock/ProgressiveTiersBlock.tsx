/* @layer renderer-components @kind component */
import { useT, useText } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { OptionGroup } from '@drizztdourden08/tessera/composites';
import { PROGRESSIVE_MODES, PROGRESSIVE_MODE_LABELS, progressiveTickConsequences, unrollableTickSetReasons } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import { ProgressiveLadderCard } from './sub-components/ProgressiveLadderCard';
import { modeOf } from './behavior/mode-of';
import { progressiveLaddersOf } from './behavior/progressive-ladders';
import { withFamilyMode } from './behavior/with-family-mode';
import { withTierTicked } from './behavior/with-tier-ticked';
import { ORDERED_MODE } from './ProgressiveTiersBlock.constants';
import type { ProgressiveTiersBlockProps } from './ProgressiveTiersBlock.type';
import './ProgressiveTiersBlock.css';

const ProgressiveTiersBlock = (props: ProgressiveTiersBlockProps) => {
  const t = useT();
  const text = useText();
  const modeOptions = PROGRESSIVE_MODES.map((mode) => ({ value: mode, label: text(PROGRESSIVE_MODE_LABELS[mode]) }));
  const { setting, modes, spritesAvailable = false, onChange, onModesChange } = props;
  const readOnly = onChange === undefined;
  const ladders = progressiveLaddersOf(setting, modes, spritesAvailable);
  const consequences = progressiveTickConsequences(setting).map(({ term, detail }) => ({ term: text(term), detail: text(detail) }));
  const blocked = unrollableTickSetReasons(setting);

  return (
    <Box className="progressive-tiers-block">
      <OptionGroup title={t('compounds:progressive-tiers-block.title')} tone="live" className="progressive-tiers-block__group">
        <Text className="progressive-tiers-block__caption">{t('compounds:progressive-tiers-block.caption')}</Text>
        <Box className="progressive-tiers-block__ladders">
          {ladders.map((ladder) => (
            <ProgressiveLadderCard
              key={ladder.id}
              ladder={ladder}
              modeOptions={modeOptions}
              modeLabel={text(PROGRESSIVE_MODE_LABELS[modeOf(ladder.mode) ?? ORDERED_MODE])}
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
            <Text className="progressive-tiers-block__blocked-lead">{t('compounds:progressive-tiers-block.blocked-lead')}</Text>
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
