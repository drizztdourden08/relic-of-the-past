/* @layer renderer-components @kind component */
import { Box, Slider, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { OptionGroup, OptionRow, ValueTag } from '@drizztdourden08/tessera/composites';
import { FINAL_FIGHT_SILVER_HITS, tickedIndexesOf, RETRO_BOW_KEY, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY, retroCostCeilingsOf, optionByKey } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
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
  const woodCost = Math.min(setting.woodArrowCost, ceilings.wood);
  const silverCost = Math.min(setting.silverArrowCost, ceilings.silver);
  const hasPlainBow = tickedIndexesOf(tiers, 'bow').includes(PLAIN_BOW_RUNG);

  return (
    <OptionGroup title={RETRO_TITLE} tone="live" className="retro-bow-block">
      {readOnly ? <ValueTag label={RETRO_SWITCH_LABEL} value={setting.enabled} /> : (
        <Toggle
          label={RETRO_SWITCH_LABEL}
          checked={setting.enabled}
          onChange={(enabled) => onChange({ ...setting, enabled })}
        />
      )}
      <Text className="retro-bow-block__caption">{retroLine()}</Text>
      <Box className="retro-bow-block__prices">
        <OptionRow
          label={nameOf(RETRO_WOOD_COST_KEY)}
          description={hasPlainBow ? undefined : <OptionDescription description={NO_PLAIN_BOW_NOTE} />}
          control={readOnly ? <ValueTag value={rupees(woodCost)} /> : (
            <Slider
              value={woodCost}
              min={0}
              max={ceilings.wood}
              step={RETRO_COST_STEP}
              disabled={!costsLive || !hasPlainBow}
              showValue
              formatValue={rupees}
              onChange={(woodArrowCost) => onChange({ ...setting, woodArrowCost })}
            />
          )}
        />
        <OptionRow
          label={nameOf(RETRO_SILVER_COST_KEY)}
          control={readOnly ? <ValueTag value={rupees(silverCost)} /> : (
            <Slider
              value={silverCost}
              min={0}
              max={ceilings.silver}
              step={RETRO_COST_STEP}
              disabled={!costsLive}
              showValue
              formatValue={rupees}
              onChange={(silverArrowCost) => onChange({ ...setting, silverArrowCost })}
            />
          )}
        />
        <Text className="retro-bow-block__ceiling">
          {ceilingNote(ceilings.wood, ceilings.silver, FINAL_FIGHT_SILVER_HITS)}
        </Text>
      </Box>
    </OptionGroup>
  );
};

export { RetroBowBlock };
