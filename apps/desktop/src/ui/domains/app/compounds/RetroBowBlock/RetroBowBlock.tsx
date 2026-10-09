/* @layer renderer-components @kind component */
import { Box, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { OptionValueTag } from '../OptionValueTag';
import { FINAL_FIGHT_SILVER_HITS } from '@rotp/randomizer';
import { tickedIndexesOf } from '@rotp/randomizer';
import { RETRO_BOW_KEY, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY } from '@rotp/randomizer';
import { retroCostCeilingsOf } from '@rotp/randomizer';
import { optionByKey } from '@rotp/randomizer';
import { OptionSliderRow } from '../OptionSliderRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import { ceilingNote } from './behavior/ceiling-note';
import {
  NO_PLAIN_BOW_NOTE, PLAIN_BOW_RUNG, RETRO_COST_STEP, RETRO_SWITCH_LABEL, RETRO_TITLE,
} from './RetroBowBlock.constants';
import type { RetroBowBlockProps } from './RetroBowBlock.type';
import './RetroBowBlock.css';

const nameOf = (key: string): string => optionByKey.get(key)?.displayName ?? key;
const retroLine = (): string => {
  const description = optionByKey.get(RETRO_BOW_KEY)?.description;
  return typeof description === 'string' ? description : '';
};
const rupees = (amount: number): string => `${amount} rupees`;

const RetroBowBlock = (props: RetroBowBlockProps) => {
  const { setting, capacity, tiers, onChange } = props;
  const readOnly = onChange === undefined;
  const costsLive = !readOnly && setting.enabled;
  const ceilings = retroCostCeilingsOf(capacity);
  const hasPlainBow = tickedIndexesOf(tiers, 'bow').includes(PLAIN_BOW_RUNG);

  return (
    <RandomizerOptionGroup title={RETRO_TITLE} live className="retro-bow-block">
      {readOnly ? <OptionValueTag label={RETRO_SWITCH_LABEL} value={setting.enabled} /> : (
        <Toggle
          label={RETRO_SWITCH_LABEL}
          checked={setting.enabled}
          onChange={(enabled) => onChange({ ...setting, enabled })}
        />
      )}
      <Text className="retro-bow-block__caption">{retroLine()}</Text>
      <Box className="retro-bow-block__prices">
        <OptionSliderRow
          label={nameOf(RETRO_WOOD_COST_KEY)}
          description={hasPlainBow ? undefined : NO_PLAIN_BOW_NOTE}
          value={Math.min(setting.woodArrowCost, ceilings.wood)}
          min={0}
          max={ceilings.wood}
          step={RETRO_COST_STEP}
          disabled={!costsLive || !hasPlainBow}
          formatValue={rupees}
          readout={readOnly}
          onChange={(woodArrowCost) => onChange?.({ ...setting, woodArrowCost })}
        />
        <OptionSliderRow
          label={nameOf(RETRO_SILVER_COST_KEY)}
          value={Math.min(setting.silverArrowCost, ceilings.silver)}
          min={0}
          max={ceilings.silver}
          step={RETRO_COST_STEP}
          disabled={!costsLive}
          formatValue={rupees}
          readout={readOnly}
          onChange={(silverArrowCost) => onChange?.({ ...setting, silverArrowCost })}
        />
        <Text className="retro-bow-block__ceiling">
          {ceilingNote(ceilings.wood, ceilings.silver, FINAL_FIGHT_SILVER_HITS)}
        </Text>
      </Box>
    </RandomizerOptionGroup>
  );
};

export { RetroBowBlock };
