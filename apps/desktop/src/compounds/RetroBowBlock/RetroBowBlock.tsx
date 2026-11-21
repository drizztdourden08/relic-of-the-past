/* @layer renderer-components @kind component */
import { Box, Slider, Text, Toggle } from '@drizztdourden08/tessera/primitives';
import { useT, useText } from '@drizztdourden08/brock-react';
import type { I18n, Text as TextOf } from '@drizztdourden08/brock-core/i18n';
import { OptionGroup, OptionRow, ValueTag } from '@drizztdourden08/tessera/composites';
import { FINAL_FIGHT_SILVER_HITS, tickedIndexesOf, RETRO_BOW_KEY, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY, retroCostCeilingsOf, optionByKey } from '@rotp/randomizer';
import { OptionDescription } from '../OptionDescription';
import { ceilingNote } from './behavior/ceiling-note';
import { PLAIN_BOW_RUNG, RETRO_COST_STEP } from './RetroBowBlock.constants';
import type { RetroBowBlockProps } from './RetroBowBlock.type';
import './RetroBowBlock.css';

const nameOf = (key: string, text: (text: TextOf) => string): string => text(optionByKey.get(key)?.displayName ?? key);
const retroLine = (): string => {
  const description = optionByKey.get(RETRO_BOW_KEY)?.description;
  return typeof description === 'string' ? description : '';
};
const rupeesOf = (t: I18n['t']) => (count: number): string => t('compounds:retro-bow-block.rupees', { count });

const RetroBowBlock = (props: RetroBowBlockProps) => {
  const t = useT();
  const text = useText();
  const rupees = rupeesOf(t);
  const { setting, capacity, tiers, onChange } = props;
  const readOnly = onChange === undefined;
  const costsLive = !readOnly && setting.enabled;
  const ceilings = retroCostCeilingsOf(capacity);
  const woodCost = Math.min(setting.woodArrowCost, ceilings.wood);
  const silverCost = Math.min(setting.silverArrowCost, ceilings.silver);
  const hasPlainBow = tickedIndexesOf(tiers, 'bow').includes(PLAIN_BOW_RUNG);

  return (
    <OptionGroup title={t('compounds:retro-bow-block.title')} tone="live" className="retro-bow-block">
      {readOnly ? <ValueTag label={t('compounds:retro-bow-block.switch')} value={setting.enabled} /> : (
        <Toggle
          label={t('compounds:retro-bow-block.switch')}
          checked={setting.enabled}
          onChange={(enabled) => onChange({ ...setting, enabled })}
        />
      )}
      <Text className="retro-bow-block__caption">{retroLine()}</Text>
      <Box className="retro-bow-block__prices">
        <OptionRow
          label={nameOf(RETRO_WOOD_COST_KEY, text)}
          description={hasPlainBow ? undefined : <OptionDescription description={t('compounds:retro-bow-block.no-plain-bow')} />}
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
          label={nameOf(RETRO_SILVER_COST_KEY, text)}
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
          {ceilingNote(ceilings.wood, ceilings.silver, FINAL_FIGHT_SILVER_HITS, t)}
        </Text>
      </Box>
    </OptionGroup>
  );
};

export { RetroBowBlock };
