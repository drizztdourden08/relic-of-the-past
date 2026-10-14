/* @layer renderer-components @kind component */
import { ShopSlotsBlock } from '@app/compounds/ShopSlotsBlock';
import { DifficultyBlock } from '@app/compounds/DifficultyBlock';
import { ProgressiveTiersBlock } from '@app/compounds/ProgressiveTiersBlock';
import { RetroBowBlock } from '@app/compounds/RetroBowBlock';
import { PondStatusNote } from '@app/compounds/PondStatusNote';
import { pondStatusOf } from '@rotp/randomizer';
import type { TabBlocksProps } from './OptionTabBody.type';

const TabLeadBlocks = ({ tab, context }: TabBlocksProps) => {
  const { choices, seed, edit, capacity, rule, heldPond } = context;

  return (
    <>
      {tab === 'pond' && <PondStatusNote lines={pondStatusOf({ ...rule, pond: heldPond })} />}
      {tab === 'shops' && (
        <ShopSlotsBlock
          scope={{ ...choices.shops, seed }}
          retroBow={choices.retroBow}
          onChange={edit((shops) => ({ ...choices, shops }))}
        />
      )}
      {tab === 'items' && (
        <>
          <ProgressiveTiersBlock
            setting={choices.progressiveTiers}
            modes={choices.progressiveModes}
            onChange={edit((progressiveTiers) => ({ ...choices, progressiveTiers }))}
            onModesChange={edit((progressiveModes) => ({ ...choices, progressiveModes }))}
          />
          <DifficultyBlock
            setting={choices.difficulty}
            tiers={choices.progressiveTiers}
            onChange={edit((difficulty) => ({ ...choices, difficulty }))}
          />
          <RetroBowBlock
            setting={choices.retroBow}
            capacity={capacity}
            tiers={choices.progressiveTiers}
            onChange={edit((retroBow) => ({ ...choices, retroBow }))}
          />
        </>
      )}
    </>
  );
};

export { TabLeadBlocks };
