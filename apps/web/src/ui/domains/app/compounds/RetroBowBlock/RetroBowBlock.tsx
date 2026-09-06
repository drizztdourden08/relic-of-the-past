/* @layer renderer-components @kind component */
/**
 * The retro block: one switch and, under it, the two costs a shot takes out
 * of the wallet. The costs go inert with the switch, because they are only a
 * question once the bow is fed rupees.
 *
 * Both sliders stop where the seed's wallet does (retro/retro-cost-ceiling.ts):
 * the plain shot at the wallet's top, the silver shot at that top divided by
 * the final fight's count of back-to-back shots. A stored cost above the live
 * top reads as the top, and the one line under the sliders says where the two
 * tops come from. The plain cost goes inert with the reason on it while the
 * plain bow rung is unticked above: the first bow found already fires silver.
 *
 * Presentational only: the setting comes in as a prop and every edit leaves as
 * a whole new setting. An absent handler renders the block frozen, which is
 * the read-only face the run view shows.
 */
import { Box, Text, Toggle } from '@ds/primitives';
import { FINAL_FIGHT_SILVER_HITS } from '@shared/randomizer/ap-world/final-fight.data';
import { tickedIndexesOf } from '@shared/randomizer/ap-world/progressive/progressive-reach';
import {
  RETRO_BOW_KEY, RETRO_SILVER_COST_KEY, RETRO_WOOD_COST_KEY,
} from '@shared/randomizer/ap-world/retro/retro-bow.data';
import { retroCostCeilingsOf } from '@shared/randomizer/ap-world/retro/retro-cost-ceiling';
import { apOptionByKey } from '@shared/randomizer/ap-world/options.data';
import { OptionSliderRow } from '../OptionSliderRow';
import { RandomizerOptionGroup } from '../RandomizerOptionGroup';
import {
  NO_PLAIN_BOW_NOTE, RETRO_COST_STEP, RETRO_SWITCH_LABEL, RETRO_TITLE, ceilingNote,
} from './RetroBowBlock.constants';
import type { RetroBowBlockProps } from './RetroBowBlock.type';
import './RetroBowBlock.css';

/** The first rung of the bow family is the plain bow; unticked, every bow found is silver. */
const PLAIN_BOW_RUNG = 0;

const nameOf = (key: string): string => apOptionByKey.get(key)?.displayName ?? key;
const retroLine = (): string => {
  const description = apOptionByKey.get(RETRO_BOW_KEY)?.description;
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
      <Toggle
        label={RETRO_SWITCH_LABEL}
        checked={setting.enabled}
        disabled={readOnly}
        onChange={(enabled) => onChange?.({ ...setting, enabled })}
      />
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
